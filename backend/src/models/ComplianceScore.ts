import mongoose, { Schema, Document } from 'mongoose';

export interface IComplianceScore extends Document {
  userId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  score: number;
  breakdown: {
    licenses: number;
    permits: number;
    safety: number;
    insurance: number;
    employee: number;
  };
  totalItems: number;
  completedItems: number;
  history: {
    score: number;
    date: Date;
  }[];
}

const ComplianceScoreSchema = new Schema<IComplianceScore>({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  businessId:  { type: Schema.Types.ObjectId, ref: 'Business' },
  score:       { type: Number, default: 0 },
  breakdown: {
    licenses:  { type: Number, default: 0 },
    permits:   { type: Number, default: 0 },
    safety:    { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    employee:  { type: Number, default: 0 },
  },
  totalItems:     { type: Number, default: 0 },
  completedItems: { type: Number, default: 0 },
  history: [{
    score: { type: Number },
    date:  { type: Date, default: Date.now },
  }],
}, { timestamps: true });

export default mongoose.models.ComplianceScore ||
  mongoose.model<IComplianceScore>('ComplianceScore', ComplianceScoreSchema);