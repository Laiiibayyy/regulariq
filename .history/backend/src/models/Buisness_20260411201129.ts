import mongoose, { Schema, Document } from 'mongoose';

export interface IBusiness extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: string;        // 'restaurant' | 'clinic' | 'retail'
  country: string;
  state: string;
  city: string;
  employees: number;
  hasAlcohol: boolean;
  hasDelivery: boolean;
  complianceScore: number;
}

const BusinessSchema = new Schema<IBusiness>({
  userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name:            { type: String, required: true },
  type:            { type: String, required: true },
  country:         { type: String, default: 'US' },
  state:           { type: String },
  city:            { type: String },
  employees:       { type: Number, default: 1 },
  hasAlcohol:      { type: Boolean, default: false },
  hasDelivery:     { type: Boolean, default: false },
  complianceScore: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Business || mongoose.model<IBusiness>('Business', BusinessSchema);
// Yeh hona chahiye
export default mongoose.model<IBusiness>('Business', BusinessSchema);