import express from 'express';
import Regulation from '../models/Regulation';
import Business from '../models/Buisness';
import { generateRegulationSummary, generateComplianceAdvice } from '../services/aiService';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get regulations for user's business
router.get('/', protect, async (req: AuthRequest, res) => {
  try {
    const business = await Business.findOne({ userId: req.userId });
    if (!business) return res.json([]);

    const regulations = await Regulation.find({
      $or: [
        { industry: business.type },
        { state: business.state },
        { state: 'ALL' },
      ]
    }).limit(20);

    res.json(regulations);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get AI summary for a regulation
router.post('/:id/summarize', protect, async (req: AuthRequest, res) => {
  try {
    const regulation = await Regulation.findById(req.params.id);
    if (!regulation) return res.status(404).json({ message: 'Not found' });

    // Already processed? Return cached
    if (regulation.aiSummary) {
      return res.json({
        summary: regulation.aiSummary,
        actionItems: regulation.aiActionItems,
        penalty: regulation.aiPenalty,
        deadline: regulation.aiDeadline,
        difficulty: regulation.aiDifficulty,
      });
    }

    const business = await Business.findOne({ userId: req.userId });
    const result = await generateRegulationSummary(
      regulation.title,
      regulation.description || regulation.title,
      business?.type || 'restaurant'
    );

    // Cache the result
    await Regulation.findByIdAndUpdate(req.params.id, {
      aiSummary: result.summary,
      aiActionItems: result.actionItems,
      aiPenalty: result.penalty,
      aiDeadline: result.deadline,
      aiDifficulty: result.difficulty,
      lastProcessed: new Date(),
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get AI compliance advice
router.get('/advice', protect, async (req: AuthRequest, res) => {
  try {
    const business = await Business.findOne({ userId: req.userId });
    if (!business) return res.json({ advice: 'Complete your business setup first.' });

    const { missingItems, score } = req.query;
    const missing = missingItems
      ? String(missingItems).split(',')
      : ['Fire safety cert', 'Food handler cert'];

    const advice = await generateComplianceAdvice(
      business.type,
      business.state,
      Number(score) || 0,
      missing
    );

    res.json({ advice });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET se seed karo — browser se seedha kaam karega
router.get('/seed-now', async (req, res) => {
  try {
    const sample = [
      {
        title: 'Food Handler Certification',
        description: 'All food handlers must complete an accredited food safety training course and obtain certification before handling food.',
        industry: ['restaurant'],
        state: 'ALL',
        category: 'certificate',
        penaltyAmount: '$100-$1,000',
        renewalPeriod: 365,
      },
      {
        title: 'Health Department Permit',
        description: 'Restaurants must obtain a health permit from the local health department before opening and renew it annually.',
        industry: ['restaurant'],
        state: 'ALL',
        category: 'permit',
        penaltyAmount: '$500-$5,000',
        renewalPeriod: 365,
      },
      {
        title: 'Fire Safety Inspection Certificate',
        description: 'Businesses must pass annual fire safety inspections conducted by the local fire department.',
        industry: ['restaurant', 'retail', 'clinic'],
        state: 'ALL',
        category: 'certificate',
        penaltyAmount: '$200-$2,000',
        renewalPeriod: 365,
      },
      {
        title: 'Business Operating License',
        description: 'All businesses must obtain a general business license from the city or county where they operate.',
        industry: ['restaurant', 'retail', 'clinic', 'construction'],
        state: 'ALL',
        category: 'license',
        penaltyAmount: '$500-$10,000',
        renewalPeriod: 365,
      },
      {
        title: 'Liquor License',
        description: 'Establishments serving alcohol must obtain a liquor license from the state alcohol control board.',
        industry: ['restaurant'],
        state: 'ALL',
        category: 'license',
        penaltyAmount: '$1,000-$30,000',
        renewalPeriod: 365,
      },
      {
        title: 'OSHA Workplace Safety Compliance',
        description: 'Employers must maintain safe working conditions per OSHA standards and display required safety posters.',
        industry: ['restaurant', 'retail', 'clinic', 'construction'],
        state: 'ALL',
        category: 'permit',
        penaltyAmount: '$15,625 per violation',
        renewalPeriod: 365,
      },
      {
        title: 'Workers Compensation Insurance',
        description: 'Businesses with employees must carry workers compensation insurance to cover work-related injuries.',
        industry: ['restaurant', 'retail', 'clinic', 'construction'],
        state: 'ALL',
        category: 'insurance',
        penaltyAmount: '$10,000-$50,000',
        renewalPeriod: 365,
      },
      {
        title: 'ADA Accessibility Compliance',
        description: 'Businesses open to the public must comply with ADA requirements for accessibility.',
        industry: ['restaurant', 'retail', 'clinic'],
        state: 'ALL',
        category: 'permit',
        penaltyAmount: '$75,000-$150,000',
        renewalPeriod: 730,
      },
    ];

    await Regulation.deleteMany({});
    await Regulation.insertMany(sample);
    res.json({ message: `✅ ${sample.length} regulations seeded successfully!` });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});