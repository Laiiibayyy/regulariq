import mongoose from 'mongoose';

const regulationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  plainEnglish: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['federal', 'state', 'local']
  },
  jurisdiction: {
    state: String,
    city: String
  },
  appliesTo: {
    businessTypes: [String]
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  }
}, {
  timestamps: true
});

export const Regulation = mongoose.model('Regulation', regulationSchema);