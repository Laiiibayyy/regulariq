import express from 'express';
import { generateAuditPDF } from '../services/pdfService';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/export', protect, async (req: AuthRequest, res) => {
  try {
    await generateAuditPDF(req.userId!, res);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;