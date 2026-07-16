import { Schema, model, models, type Document, type Model } from "mongoose";

export interface EmailPreferences extends Document {
  userId: string;
  email: string;
  isSubscribed: boolean;
  unsubscribeToken: string;
  createdAt: Date;
}

const EmailPreferencesSchema = new Schema<EmailPreferences>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    isSubscribed: { type: Boolean, default: true },
    unsubscribeToken: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

EmailPreferencesSchema.index({ isSubscribed: 1 });

export const EmailPreferences: Model<EmailPreferences> =
  (models?.EmailPreferences as Model<EmailPreferences>) ||
  model<EmailPreferences>("EmailPreferences", EmailPreferencesSchema);
