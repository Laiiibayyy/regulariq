import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessType: {
    type: String,
    enum: ['restaurant', 'clinic', 'retail', 'construction'],
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  location: {
    state: { type: String, required: true },
    city: { type: String, required: true }
  },
  metrics: {
    employeeCount: Number,
    servesAlcohol: { type: Boolean, default: false }
  },
  complianceScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export const Business = mongoose.model('Business', businessSchema);