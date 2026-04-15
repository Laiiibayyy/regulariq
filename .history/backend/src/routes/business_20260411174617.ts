import express from 'express';
import { Business } from '..';
import { ComplianceItem } from '../models/ComplianceItem';
import { Regulation } from '../models/Regulation';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

// Onboarding
router.post('/onboarding', async (req: AuthRequest, res) => {
  try {
    const { businessType, businessName, location, metrics } = req.body;

    const business = await Business.create({
      userId: req.userId,
      businessType,
      businessName,
      location,
      metrics
    });

    // Get applicable regulations
    const regulations = await Regulation.find({
      'appliesTo.businessTypes': businessType
    });

    // Create compliance items
    for (const reg of regulations) {
      await ComplianceItem.create({
        businessId: business._id,
        regulationId: reg._id,
        status: 'pending'
      });
    }

    res.json({ business, regulationsCount: regulations.length });
  } catch (error) {
    res.status(500).json({ error: 'Onboarding failed' });
  }
});

// Get Dashboard
router.get('/dashboard', async (req: AuthRequest, res) => {
  try {
    const business = await Business.findOne({ userId: req.userId });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const complianceItems = await ComplianceItem.find({ businessId: business._id })
      .populate('regulationId');

    const total = complianceItems.length;
    const completed = complianceItems.filter(i => i.status === 'verified').length;
    const score = total > 0 ? (completed / total) * 100 : 0;

    business.complianceScore = score;
    await business.save();

    res.json({
      business,
      complianceScore: score,
      stats: { total, completed, pending: total - completed },
      items: complianceItems
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

export default router;