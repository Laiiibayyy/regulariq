import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  businessName: {
    type: String,
    trim: true
  },
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
    emailAlerts: { 
      type: Boolean, 
      default: true 
    },
    smsAlerts: { 
      type: Boolean, 
      default: false 
    },
    phoneNumber: {
      type: String,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
    }
  }
}, {
  timestamps: true  // This automatically handles createdAt & updatedAt
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ stripeCustomerId: 1 });

export const User = mongoose.model('User', userSchem