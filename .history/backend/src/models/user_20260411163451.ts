import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  businessName: String,
  stripeCustomerId: String,
  subscriptionTier: {
    type: String,
    enum: ['starter', 'business', 'professional'],
    default: 'starter'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'past_due', 'canceled', 'trialing'],
    default: 'trialing'
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  preferences: {
    alertDays: {
      type: [Number],
      default: [90, 60, 30, 14, 7, 1]
    },
    emailAlerts: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
    phoneNumber: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const newLocal = userSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export const User = mongoose.model('User', userSchema);