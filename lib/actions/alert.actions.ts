'use server';

import { connectToDatabase } from '@/database/mongoose';
import { PriceAlert } from '@/database/models/priceAlert.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { inngest } from '@/lib/inngest/client';

async function getCurrentUser() {
  const session = await auth?.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export const createAlert = async (
  symbol: string,
  company: string,
  targetPrice: number,
  condition: "above" | "below"
) => {
  const user = await getCurrentUser();
  if (!user?.email) {
    return { success: false, error: 'Please sign in to create alerts.' };
  }

  const normalizedSymbol = symbol?.trim().toUpperCase();
  const normalizedCompany = company?.trim() || normalizedSymbol || 'Unknown company';

  if (!normalizedSymbol) {
    return { success: false, error: 'A stock symbol is required.' };
  }

  if (!targetPrice || targetPrice <= 0) {
    return { success: false, error: 'Please enter a valid target price.' };
  }

  try {
    await connectToDatabase();

    const alert = await PriceAlert.create({
      userId: user.id,
      symbol: normalizedSymbol,
      company: normalizedCompany,
      targetPrice,
      condition,
      isTriggered: false,
    });

    return { success: true, alert };
  } catch (err) {
    console.error('createAlert error:', err);
    return { success: false, error: 'Could not create price alert.' };
  }
};

export const deleteAlert = async (alertId: string) => {
  const user = await getCurrentUser();
  if (!user?.email) {
    return { success: false, error: 'Please sign in to delete alerts.' };
  }

  try {
    await connectToDatabase();
    const result = await PriceAlert.deleteOne({ _id: alertId, userId: user.id });

    if (result.deletedCount === 0) {
      return { success: false, error: 'Alert not found or you do not have permission to delete it.' };
    }

    return { success: true };
  } catch (err) {
    console.error('deleteAlert error:', err);
    return { success: false, error: 'Could not delete price alert.' };
  }
};

export const getUserAlerts = async () => {
  const user = await getCurrentUser();
  if (!user?.email) {
    return [];
  }

  try {
    await connectToDatabase();
    const alerts = await PriceAlert.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .lean();

    return alerts;
  } catch (err) {
    console.error('getUserAlerts error:', err);
    return [];
  }
};

export const markAlertTriggered = async (alertId: string) => {
  try {
    await connectToDatabase();
    const result = await PriceAlert.updateOne(
      { _id: alertId },
      { $set: { isTriggered: true } }
    );

    return result.modifiedCount > 0;
  } catch (err) {
    console.error('markAlertTriggered error:', err);
    return false;
  }
};

export const getUntriggeredAlerts = async () => {
  try {
    await connectToDatabase();
    const alerts = await PriceAlert.find({ isTriggered: false })
      .lean();

    return alerts;
  } catch (err) {
    console.error('getUntriggeredAlerts error:', err);
    return [];
  }
};