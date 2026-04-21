import express from 'express';
import multer from 'multer';
import DocumentModel from '../models/Document';
import { uploadToS3, deleteFromS3, getSignedUrl } from '../services/s3Service';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and images allowed'));
  },
});

// Upload document
router.post('/upload', protect, upload.single('document'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { category, expiryDate, notes } = req.body;

    const fileUrl = await uploadToS3(req.file, req.userId!);

    const doc = await DocumentModel.create({
      userId:       req.userId,
      fileName:     req.file.originalname,
      originalName: req.file.originalname,
      fileUrl,
      fileSize:     req.file.size,
      fileType:     req.file.mimetype,   // ✅ req.file.mimetype
      category:     category || 'general',
      expiryDate:   expiryDate ? new Date(expiryDate) : undefined,
      notes:        notes || '',
      status:       'active',
    });

    res.status(201).json(doc);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get all documents
router.get('/', protect, async (req: AuthRequest, res) => {
  try {
    const docs = await DocumentModel.find({ userId: req.userId }).sort({ createdAt: -1 });

    const docsWithUrls = docs.map(doc => ({
      ...doc.toObject(),
      signedUrl: getSignedUrl(doc.fileUrl),
    }));

    res.json(docsWithUrls);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete document
router.delete('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const doc = await DocumentModel.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    await deleteFromS3(doc.fileUrl);
    await DocumentModel.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update document
router.patch('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const { expiryDate, notes, status } = req.body;
    const doc = await DocumentModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { expiryDate, notes, status },
      { new: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;