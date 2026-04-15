import mongoose from 'mongoose';

const complianceItemSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  regulationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Regulation',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'uploaded', 'verified', 'expired', 'renewed'],
    default: 'pending'
  },
  expiryDate: Date,
  documentUrls: [String],
  notes: String,
  alertHistory: [{
    sentAt: { type: Date, default: Date.now },
    daysBefore: Number,
    channel: {
      type: String,
      enum: ['email', 'sms']
    }
  }],
  lastRenewedAt: Date,
  nextDeadline: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

complianceItemSchema.index({ businessId: 1, expiryDate: 1 });
complianceItemSchema.index({ businessId: 1, status: 1 });

export const ComplianceItem = mongoose.model('ComplianceItem', complianceItemSchema);

const complianceItemSchema = new mongoose.Schema({
  // ... other fields
  alertHistory: [{
    sentAt: { type: Date, default: Date.now },
    daysBefore: Number,
    channel: {
      type: String,
      enum: ['email', 'sms', 'both'],
      default: 'email'
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent'
    }
  }]
}, {
  timestamps: true
});