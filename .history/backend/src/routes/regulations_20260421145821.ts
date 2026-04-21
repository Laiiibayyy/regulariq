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

