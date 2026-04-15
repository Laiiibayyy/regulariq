import mongoose from 'mongoose';

const regulationSchema = new mongoose.Schema({
  source: {
    type: String,
    enum: ['federal', 'state', 'local'],
    required: true
  },
  agency: String,
  regulationId: String,
  title: {
    type: String,
    required: true
  },
  plainEnglish: String,
  jurisdiction: {
    country: String,
    state: String,
    cities: [String]
  },
  appliesTo: {
    businessTypes: [String],
    minEmployees: Number,
    requiresAlcohol: Boolean,
    requiresDelivery: Boolean,
    requiresKitchen: Boolean
  },
  actionItems: [{
    description: String,
    frequency: {
      type: String,
      enum: ['annual', 'biennial', 'quarterly', 'monthly', 'one-time']
    },
    deadlineFormula: String
  }],
  penaltyAmount: String,
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  sourceUrl: String,
  lastUpdated: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

regulationSchema.index({ 'jurisdiction.state': 1, 'appliesTo.businessTypes': 1 });
regulationSchema.index({ title: 'text', plainEnglish: 'text' });

export const Regulation = mongoose.model('Regulation', regulationSchema);