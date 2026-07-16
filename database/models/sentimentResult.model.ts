import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface SentimentResult extends Document {
  symbol: string;
  score: number;
  label: "Bullish" | "Bearish" | "Neutral";
  summary: string;
  keyFactors: string[];
  analyzedAt: Date;
}

const SentimentResultSchema = new Schema<SentimentResult>(
  {
    symbol: { type: String, required: true, uppercase: true, trim: true, unique: true },
    score: { type: Number, required: true, min: 1, max: 10 },
    label: { type: String, required: true, enum: ["Bullish", "Bearish", "Neutral"] },
    summary: { type: String, required: true },
    keyFactors: { type: [String], default: [] },
    analyzedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const SentimentResult: Model<SentimentResult> =
  (models?.SentimentResult as Model<SentimentResult>) ||
  model<SentimentResult>('SentimentResult', SentimentResultSchema);