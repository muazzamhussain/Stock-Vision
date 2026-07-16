'use server';

import { connectToDatabase } from '@/database/mongoose';
import { ChartConfig } from '@/database/models/chartConfig.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export const saveChartConfig = async (
  symbol: string,
  indicators: string[],
  notes: string
) => {
  const user = await getCurrentUser();
  if (!user?.email) {
    return { success: false, error: 'Please sign in to save chart configurations.' };
  }

  const normalizedSymbol = symbol?.trim().toUpperCase();
  if (!normalizedSymbol) {
    return { success: false, error: 'A stock symbol is required.' };
  }

  try {
    await connectToDatabase();

    const result = await ChartConfig.findOneAndUpdate(
      { userId: user.id, symbol: normalizedSymbol },
      {
        indicators,
        notes,
        updatedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return { success: true, config: result };
  } catch (err) {
    console.error('saveChartConfig error:', err);
    return { success: false, error: 'Could not save chart configuration.' };
  }
};

export const getChartConfig = async (symbol: string) => {
  const user = await getCurrentUser();
  if (!user?.email) {
    return null;
  }

  const normalizedSymbol = symbol?.trim().toUpperCase();
  if (!normalizedSymbol) {
    return null;
  }

  try {
    await connectToDatabase();
    const config = await ChartConfig.findOne({
      userId: user.id,
      symbol: normalizedSymbol,
    }).lean();

    return config;
  } catch (err) {
    console.error('getChartConfig error:', err);
    return null;
  }
};