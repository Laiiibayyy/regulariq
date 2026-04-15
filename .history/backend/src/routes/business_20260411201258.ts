import express from 'express';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Save onboarding data
router.post('/onboarding', protect, async (req: AuthRequest, res) => {
  try {
    const { name, type, state, city, employees, hasAlcohol, hasDelivery } = req.body;

    const business = await usiness.create({
      userId: req.userId,
      name, type, state, city,
      employees, hasAlcohol, hasDelivery,
      complianceScore: 0
    });

    res.status(201).json(business);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get business details
router.get('/me', protect, async (req: AuthRequest, res) => {
  try {
    const business = await business.findOne({ userId: req.userId });
    res.json(business);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;