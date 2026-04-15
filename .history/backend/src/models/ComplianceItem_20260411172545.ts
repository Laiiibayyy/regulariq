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
    enum: ['pending', 'verified', 'expired', 'renewed'],
    default: 'pending'
  },
  expiryDate: Date,
  alertHistory: [{
    daysBefore: Number,
    sentAt: Date,
    channel: String
  }]
}, {
  timestamps: true
});

export const ComplianceItem = mongoose.model('ComplianceItem', complianceItemSchema);