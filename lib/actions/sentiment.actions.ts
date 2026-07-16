'use server';

import { connectToDatabase } from '@/database/mongoose';
import { SentimentResult } from '@/database/models/sentimentResult.model';
import { inngest } from '@/lib/inngest/client';

export const getSentimentForSymbol = async (symbol: string) => {
  const normalizedSymbol = symbol?.trim().toUpperCase();
  if (!normalizedSymbol) {
    return null;
  }

  try {
    await connectToDatabase();
    const result = await SentimentResult.findOne({ symbol: normalizedSymbol })
      .sort({ analyzedAt: -1 })
      .lean();

    return result;
  } catch (err) {
    console.error('getSentimentForSymbol error:', err);
    return null;
  }
};

export const triggerSentimentAnalysis = async (symbol: string) => {
  const normalizedSymbol = symbol?.trim().toUpperCase();
  if (!normalizedSymbol) {
    return { success: false, error: 'Invalid symbol.' };
  }

  try {
    await inngest.send({
      name: "app/sentiment.analyze",
      data: { symbol: normalizedSymbol },
    });

    return { success: true };
  } catch (err) {
    console.error('triggerSentimentAnalysis error:', err);
    return { success: false, error: 'Failed to trigger sentiment analysis.' };
  }
};

export const saveSentimentResult = async (
  symbol: string,
  score: number,
  label: "Bullish" | "Bearish" | "Neutral",
  summary: string,
  keyFactors: string[]
) => {
  const normalizedSymbol = symbol?.trim().toUpperCase();
  if (!normalizedSymbol) {
    return { success: false, error: 'Invalid symbol.' };
  }

  try {
    await connectToDatabase();
    
    const result = await SentimentResult.findOneAndUpdate(
      { symbol: normalizedSymbol },
      {
        symbol: normalizedSymbol,
        score,
        label,
        summary,
        keyFactors,
        analyzedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return { success: true, result };
  } catch (err) {
    console.error('saveSentimentResult error:', err);
    return { success: false, error: 'Failed to save sentiment result.' };
  }
};