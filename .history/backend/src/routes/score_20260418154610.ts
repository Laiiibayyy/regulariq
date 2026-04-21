import express from 'express';
import ComplianceScore from '../models/ComplianceScore';
import { calculateScore } from '../services/scoreService';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get current score
router.get('/', protect, async (req: AuthRequest, res) => {
  try {
    let scoreDoc = await ComplianceScore.findOne({ userId: req.userId });

    if (!scoreDoc) {
      const score = await calculateScore(req.userId!);
      scoreDoc = await ComplianceScore.findOne({ userId: req.userId });
    }

    res.json(scoreDoc);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Recalculate score
router.post('/calculate', protect, async (req: AuthRequest, res) => {
  try {
    const score = await calculateScore(req.userId!);
    const scoreDoc = await ComplianceScore.findOne({ userId: req.userId });
    res.json({ score, data: scoreDoc });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;