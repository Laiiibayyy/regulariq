import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  businessName: String,
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  preferences: {
    emailAlerts: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
    phoneNumber: String
  }
}, {
  timestamps: true
});

export const User = mongoose.model('User', userSchema);