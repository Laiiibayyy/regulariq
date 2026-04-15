import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  type: string;        // 'email' | 'sms' | 'both'
  daysBeforeExpiry: number;
  documentId?: mongoose.Types.ObjectId;
  status: string;      // 'active' | 'sent' | 'dismissed'
  sentAt?: Date;
}

const AlertSchema = new Schema<IAlert>({
  userId:           { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title:            { type: String, required: true },
  type:             { type: String, default: 'email' },
  daysBeforeExpiry: { type: Number, default: 30 },
  documentId:       { type: Schema.Types.ObjectId, ref: 'Document' },
  status:           { type: String, default: 'active' },
  sentAt:           { type: Date },
}, { timestamps: true });

export default mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema);