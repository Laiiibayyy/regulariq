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
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: String,
    address: String
  },
  metrics: {
    employeeCount: Number,
    servesAlcohol: { type: Boolean, default: false },
    offersDelivery: { type: Boolean, default: false },
    seatingCapacity: Number,
    hasMinorWorkers: { type: Boolean, default: false },
    hasKitchen: { type: Boolean, default: true }
  },
  complianceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  locations: [{
    name: String,
    address: String,
    complianceScore: Number
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Business = mongoose.model('Business', businessSchema);