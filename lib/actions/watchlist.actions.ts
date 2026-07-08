'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

async function getUserIdFromEmail(email: string): Promise<string | null> {
  if (!email) return null;

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });
    if (!user) return null;

    return (user.id as string) || String(user._id || '');
  } catch (err) {
    console.error('getUserIdFromEmail error:', err);
    return null;
  }
}

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const userId = await getUserIdFromEmail(email);
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((item) => String(item.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

export async function addToWatchlist(symbol: string, company?: string) {
  const user = await getCurrentUser();
  if (!user?.email) {
    return { success: false, error: 'Please sign in to update your watchlist.' };
  }

  const normalizedSymbol = symbol?.trim().toUpperCase();
  const normalizedCompany = company?.trim() || normalizedSymbol || 'Unknown company';

  if (!normalizedSymbol) {
    return { success: false, error: 'A stock symbol is required.' };
  }

  try {
    const userId = await getUserIdFromEmail(user.email);
    if (!userId) {
      return { success: false, error: 'Unable to resolve your account.' };
    }

    await Watchlist.updateOne(
      { userId, symbol: normalizedSymbol },
      { $setOnInsert: { userId, symbol: normalizedSymbol, company: normalizedCompany, addedAt: new Date() } },
      { upsert: true }
    );

    return { success: true, symbol: normalizedSymbol, added: true };
  } catch (err) {
    console.error('addToWatchlist error:', err);
    return { success: false, error: 'Could not add stock to watchlist.' };
  }
}

export async function removeFromWatchlist(symbol: string) {
  const user = await getCurrentUser();
  if (!user?.email) {
    return { success: false, error: 'Please sign in to update your watchlist.' };
  }

  const normalizedSymbol = symbol?.trim().toUpperCase();
  if (!normalizedSymbol) {
    return { success: false, error: 'A stock symbol is required.' };
  }

  try {
    const userId = await getUserIdFromEmail(user.email);
    if (!userId) {
      return { success: false, error: 'Unable to resolve your account.' };
    }

    await Watchlist.deleteOne({ userId, symbol: normalizedSymbol });
    return { success: true, symbol: normalizedSymbol, added: false };
  } catch (err) {
    console.error('removeFromWatchlist error:', err);
    return { success: false, error: 'Could not remove stock from watchlist.' };
  }
}

export async function toggleWatchlist(symbol: string, company?: string, shouldAdd?: boolean) {
  if (shouldAdd) {
    return addToWatchlist(symbol, company);
  }

  return removeFromWatchlist(symbol);
}
