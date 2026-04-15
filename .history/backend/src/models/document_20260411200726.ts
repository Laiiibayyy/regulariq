import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  regulationId: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  expiryDate: Date;
  status: string; // 'active' | 'expiring' | 'expired'
}

const DocumentSchema = new Schema<IDocument>({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  regulationId: { type: Schema.Types.ObjectId, ref: 'Regulation' },
  fileName:     { type: String, required: true },
  fileUrl:      { type: String },
  expiryDate:   { type: Date },
  status:       { type: String, default: 'active' },
}, { timestamps: true });

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);