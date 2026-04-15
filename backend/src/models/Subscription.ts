import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  plan: string;
  status: string;
  currentPeriodEnd: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  userId:                 { type: Schema.Types.ObjectId, ref: 'User', required: true },
  stripeCustomerId:       { type: String, required: true },
  stripeSubscriptionId:   { type: String, required: true },
  plan:                   { type: String, default: 'starter' },
  status:                 { type: String, default: 'active' },
  currentPeriodEnd:       { type: Date },
}, { timestamps: true });

export default mongoose.models.Subscription ||
  mongoose.model<ISubscription>('Subscription', SubscriptionSchema);