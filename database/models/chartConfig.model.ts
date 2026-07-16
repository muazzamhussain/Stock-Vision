import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface ChartConfig extends Document {
  userId: string;
  symbol: string;
  indicators: string[];
  notes: string;
  updatedAt: Date;
}

const ChartConfigSchema = new Schema<ChartConfig>(
  {
    userId: { type: String, required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    indicators: { type: [String], default: [] },
    notes: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

ChartConfigSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const ChartConfig: Model<ChartConfig> =
  (models?.ChartConfig as Model<ChartConfig>) ||
  model<ChartConfig>('ChartConfig', ChartConfigSchema);