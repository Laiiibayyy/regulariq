import express from 'express';
import { Business } from '../models/Business';
import { Regulation } from '../models/Regulation';
import { ComplianceItem } from '../models/ComplianceItem';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Complete onboarding
router.post('/onboarding', async (req: AuthRequest, res) => {
  try {
    const {
      businessType,
      businessName,
      location,
      metrics
    } = req.body;

    // Create business
    const business = await Business.create({
      userId: req.userId,
      businessType,
      businessName,
      location,
      metrics
    });

    // Find applicable regulations
    const regulations = await Regulation.find({
      $or: [
        { 'jurisdiction.country': location.country },
        { 'jurisdiction.state': location.state },
        { 'jurisdiction.cities': location.city }
      ],
      'appliesTo.businessTypes': businessType,
      isActive: true
    });

    // Create compliance items
    const complianceItems = regulations.map(reg => ({
      businessId: business._id,
      regulationId: reg._id,
      status: 'pending'
    }));

    await ComplianceItem.insertMany(complianceItems);

    // Calculate initial score
    const completedCount = 0;
    const totalCount = complianceItems.length;
    const score = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    business.complianceScore = score;
    await business.save();

    res.json({
      business,
      complianceItemsCount: complianceItems.length,
      complianceScore: score
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

// Get business dashboard
router.get('/dashboard', async (req: AuthRequest, res) => {
  try {
    const business = await Business.findOne({ userId: req.userId });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const complianceItems = await ComplianceItem.find({ businessId: business._id })
      .populate('regulationId');

    // Calculate upcoming deadlines
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const upcomingDeadlines = complianceItems.filter(item => 
      item.expiryDate && 
      item.expiryDate > today && 
      item.expiryDate <= thirtyDaysFromNow &&
      item.status !== 'renewed'
    );

    const expiredItems = complianceItems.filter(item =>
      item.expiryDate && 
      item.expiryDate < today &&
      item.status !== 'renewed'
    );

    const completedItems = complianceItems.filter(item =>
      item.status === 'verified' || item.status === 'renewed'
    );

    const score = (completedItems.length / complianceItems.length) * 100;
    business.complianceScore = score;
    await business.save();

    res.json({
      business,
      complianceScore: score,
      stats: {
        total: complianceItems.length,
        completed: completedItems.length,
        pending: complianceItems.length - completedItems.length,
        upcomingDeadlines: upcomingDeadlines.length,
        expired: expiredItems.length
      },
      upcomingDeadlines,
      expiredItems,
      allItems: complianceItems
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

export default router;