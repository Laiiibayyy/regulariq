import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  category: string;
  expiryDate: Date;
  status: string;
  notes: string;
}

const DocumentSchema = new Schema<IDocument>({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  businessId:   { type: Schema.Types.ObjectId, ref: 'Business' },
  fileName:     { type: String, required: true },
  originalName: { type: String, required: true },
  fileUrl:      { type: String, required: true },
  fileSize:     { type: Number },
  fileType:     { type: String },
  category:     { type: String, default: 'general' },
  expiryDate:   { type: Date },
  status:       { type: String, default: 'active' },
  notes:        { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Document ||
  mongoose.model<IDocument>('Document', DocumentSchema);