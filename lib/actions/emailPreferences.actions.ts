'use server';

import { connectToDatabase } from '@/database/mongoose';
import { EmailPreferences } from '@/database/models/emailPreferences.model';
import crypto from 'crypto';

export const getOrCreateEmailPreferences = async (userId: string, email: string) => {
  try {
    await connectToDatabase();
    
    let prefs = await EmailPreferences.findOne({ userId });
    
    if (!prefs) {
      const token = crypto.randomUUID();
      prefs = await EmailPreferences.create({
        userId,
        email,
        isSubscribed: true,
        unsubscribeToken: token,
      });
    }
    
    return prefs;
  } catch (err) {
    console.error('getOrCreateEmailPreferences error:', err);
    return null;
  }
};

export const getEmailPreferencesByUserId = async (userId: string) => {
  try {
    await connectToDatabase();
    const prefs = await EmailPreferences.findOne({ userId });
    return prefs;
  } catch (err) {
    console.error('getEmailPreferencesByUserId error:', err);
    return null;
  }
};

export const unsubscribeByToken = async (token: string) => {
  try {
    await connectToDatabase();
    const result = await EmailPreferences.findOneAndUpdate(
      { unsubscribeToken: token },
      { $set: { isSubscribed: false } },
      { new: true }
    );
    
    return result ? { success: true, email: result.email } : { success: false };
  } catch (err) {
    console.error('unsubscribeByToken error:', err);
    return { success: false };
  }
};

export const resubscribeByToken = async (token: string) => {
  try {
    await connectToDatabase();
    const result = await EmailPreferences.findOneAndUpdate(
      { unsubscribeToken: token },
      { $set: { isSubscribed: true } },
      { new: true }
    );
    
    return result ? { success: true, email: result.email } : { success: false };
  } catch (err) {
    console.error('resubscribeByToken error:', err);
    return { success: false };
  }
};

export const getSubscribedUsers = async () => {
  try {
    await connectToDatabase();
    const prefs = await EmailPreferences.find({ isSubscribed: true }).lean();
    
    // Get user details from the user collection
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('Mongoose connection not connected');

    const userIds = prefs.map(p => p.userId);
    const users = await db.collection('user').find(
      { id: { $in: userIds } },
      { projection: { id: 1, email: 1, name: 1 } }
    ).toArray();

    const userMap = new Map(users.map(u => [u.id, u]));
    
    return prefs
      .map(pref => {
        const user = userMap.get(pref.userId);
        return user ? {
          id: user.id,
          email: user.email,
          name: user.name,
          unsubscribeToken: pref.unsubscribeToken,
        } : null;
      })
      .filter(user => user !== null);
  } catch (err) {
    console.error('getSubscribedUsers error:', err);
    return [];
  }
};

export const toggleEmailSubscription = async (userId: string, isSubscribed: boolean) => {
  try {
    await connectToDatabase();
    const result = await EmailPreferences.findOneAndUpdate(
      { userId },
      { $set: { isSubscribed } },
      { new: true }
    );
    
    return result ? { success: true } : { success: false, error: 'User not found' };
  } catch (err) {
    console.error('toggleEmailSubscription error:', err);
    return { success: false, error: 'Failed to update subscription' };
  }
};