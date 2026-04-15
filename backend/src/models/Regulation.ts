import mongoose, { Schema, Document } from 'mongoose';

export interface IRegulation extends Document {
  title: string;
  description: string;
  industry: string[];
  state: string;
  category: string;
  penaltyAmount: string;
  renewalPeriod: number; // days
}

const RegulationSchema = new Schema<IRegulation>({
  title:         { type: String, required: true },
  description:   { type: String },
  industry:      [{ type: String }],
  state:         { type: String, default: 'ALL' },
  category:      { type: String }, // 'license' | 'permit' | 'safety'
  penaltyAmount: { type: String },
  renewalPeriod: { type: Number, default: 365 },
}, { timestamps: true });

export default mongoose.models.Regulation || mongoose.model<IRegulation>('Regulation', RegulationSchema);