import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface PriceAlert extends Document {
  userId: string;
  symbol: string;
  company: string;
  targetPrice: number;
  condition: "above" | "below";
  isTriggered: boolean;
  createdAt: Date;
}

const PriceAlertSchema = new Schema<PriceAlert>(
  {
    userId: { type: String, required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    company: { type: String, required: true, trim: true },
    targetPrice: { type: Number, required: true },
    condition: { 
      type: String, 
      required: true, 
      enum: ["above", "below"],
    },
    isTriggered: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Index for efficient querying of untriggered alerts
PriceAlertSchema.index({ isTriggered: 1 });
PriceAlertSchema.index({ userId: 1, symbol: 1 });

export const PriceAlert: Model<PriceAlert> =
  (models?.PriceAlert as Model<PriceAlert>) || 
  model<PriceAlert>('PriceAlert', PriceAlertSchema);