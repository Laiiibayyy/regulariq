import express from 'express';
import { ComplianceItem } from '../models/ComplianceItem';
import { Business } from '../models/Business';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

// Upload document for compliance item
router.post('/item/:itemId/upload', async (req: AuthRequest, res) => {
  try {
    const { itemId } = req.params;
    const { documentUrl, expiryDate } = req.body;

    const business = await Business.findOne({ userId: req.userId });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const item = await ComplianceItem.findOne({
      _id: itemId,
      businessId: business._id
    });

    if (!item) {
      return res.status(404).json({ error: 'Compliance item not found' });
    }

    item.documentUrls.push(documentUrl);
    item.expiryDate = expiryDate ? new Date(expiryDate) : item.expiryDate;
    item.status = 'uploaded';
    item.updatedAt = new Date();
    await item.save();

    // Recalculate score
    const allItems = await ComplianceItem.find({ businessId: business._id });
    const completed = allItems.filter(i => i.status === 'verified' || i.status === 'renewed').length;
    const score = (completed / allItems.length) * 100;
    business.complianceScore = score;
    await business.save();

    res.json({ item, newScore: score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Mark item as complete
router.post('/item/:itemId/complete', async (req: AuthRequest, res) => {
  try {
    const { itemId } = req.params;

    const business = await Business.findOne({ userId: req.userId });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const item = await ComplianceItem.findOne({
      _id: itemId,
      businessId: business._id
    });

    if (!item) {
      return res.status(404).json({ error: 'Compliance item not found' });
    }

    item.status = 'verified';
    item.updatedAt = new Date();
    await item.save();

    // Recalculate score
    const allItems = await ComplianceItem.find({ businessId: business._id });
    const completed = allItems.filter(i => i.status === 'verified' || i.status === 'renewed').length;
    const score = (completed / allItems.length) * 100;
    business.complianceScore = score;
    await business.save();

    res.json({ item, newScore: score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark complete' });
  }
});

export default router;