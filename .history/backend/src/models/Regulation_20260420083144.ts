import mongoose, { Schema, Document } from 'mongoose';

export interface IRegulation extends Document {
  title: string;
  description: string;
  industry: string[];
  state: string;
  category: string;
  penaltyAmount: string;
  renewalPeriod: number;
  aiSummary?: string;
  aiActionItems?: string[];
  aiPenalty?: string;
  aiDeadline?: string;
  aiDifficulty?: string;
  lastProcessed?: Date;
}

const RegulationSchema = new Schema<IRegulation>({
  title:          { type: String, required: true },
  description:    { type: String },
  industry:       [{ type: String }],
  state:          { type: String, default: 'ALL' },
  category:       { type: String },
  penaltyAmount:  { type: String },
  renewalPeriod:  { type: Number, default: 365 },
  aiSummary:      { type: String },
  aiActionItems:  [{ type: String }],
  aiPenalty:      { type: String },
  aiDeadline:     { type: String },
  aiDifficulty:   { type: String },
  lastProcessed:  { type: Date },
}, { timestamps: true });

export default mongoose.models.Regulation ||
  mongoose.model<IRegulation>('Regulation', RegulationSchema);