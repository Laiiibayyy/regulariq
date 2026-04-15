import express from 'express';
import Alert from '../models/Alert';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all alerts
router.get('/', protect, async (req: AuthRequest, res) => {
  try {
    const alerts = await Alert.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create alert
router.post('/', protect, async (req: AuthRequest, res) => {
  try {
    const { title, type, daysBeforeExpiry, documentId } = req.body;
    const alert = await Alert.create({
      userId: req.userId,
      title, type, daysBeforeExpiry, documentId,
      status: 'active'
    });
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete alert
router.delete('/:id', protect, async (req: AuthRequest, res) => {
  try {
    await Alert.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Alert deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;