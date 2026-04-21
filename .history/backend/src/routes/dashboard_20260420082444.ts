import express from 'express';
import DocumentModel from '../models/Document';
import Employee from '../models/Employee';
import ComplianceScore from '../models/ComplianceScore';
import Business from '../models/Buisness';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/stats', protect, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    // Documents
    const docs = await DocumentModel.find({ userId });
    const now = Date.now();

    const activeDocs = docs.filter(d => {
      if (!d.expiryDate) return true;
      return new Date(d.expiryDate).getTime() > now;
    });

    const expiringDocs = docs.filter(d => {
      if (!d.expiryDate) return false;
      const days = Math.ceil((new Date(d.expiryDate).getTime() - now) / 86400000);
      return days > 0 && days <= 30;
    });

    const expiredDocs = docs.filter(d => {
      if (!d.expiryDate) return false;
      return new Date(d.expiryDate).getTime() < now;
    });

    // Upcoming deadlines (next 90 days)
    const upcomingDeadlines = docs
      .filter(d => {
        if (!d.expiryDate) return false;
        const days = Math.ceil((new Date(d.expiryDate).getTime() - now) / 86400000);
        return days > 0 && days <= 90;
      })
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
      .slice(0, 5)
      .map(d => ({
        _id: d._id,
        title: d.originalName || d.fileName,
        category: d.category,
        expiryDate: d.expiryDate,
        daysLeft: Math.ceil((new Date(d.expiryDate).getTime() - now) / 86400000),
      }));

    // Compliance score
    const scoreDoc = await ComplianceScore.findOne({ userId });
    const score = scoreDoc?.score || 0;
    const breakdown = scoreDoc?.breakdown || {};
    const history = scoreDoc?.history || [];

    // Business
    const business = await Business.findOne({ userId });

    // Employees
    const employees = await Employee.find({ userId, status: 'active' });
    const totalCerts = employees.reduce((acc, e) => acc + e.certifications.length, 0);
    const expiringCerts = employees.reduce((acc, e) =>
      acc + e.certifications.filter((c: any) => {
        const days = Math.ceil((new Date(c.expiryDate).getTime() - now) / 86400000);
        return days > 0 && days <= 30;
      }).length, 0);

    // Checklist items
    const checklist = [
      { text: 'Business licence', category: 'license' },
      { text: 'Health permit', category: 'permit' },
      { text: 'Fire safety cert', category: 'certificate' },
      { text: 'Business insurance', category: 'insurance' },
      { text: 'Food handler cert', category: 'certificate' },
    ].map(item => {
      const doc = docs.find(d => d.category === item.category);
      if (!doc) return { ...item, status: 'Missing' };
      if (!doc.expiryDate) return { ...item, status: 'Done' };
      const days = Math.ceil((new Date(doc.expiryDate).getTime() - now) / 86400000);
      if (days < 0) return { ...item, status: 'Expired' };
      if (days <= 30) return { ...item, status: 'Expiring' };
      return { ...item, status: 'Done' };
    });

    res.json({
      score,
      breakdown,
      history,
      business,
      docs: {
        total: docs.length,
        active: activeDocs.length,
        expiring: expiringDocs.length,
        expired: expiredDocs.length,
        recent: docs.slice(0, 4).map(d => ({
          _id: d._id,
          name: d.originalName || d.fileName,
          category: d.category,
          expiryDate: d.expiryDate,
          ok: !d.expiryDate || new Date(d.expiryDate).getTime() > now + 30 * 86400000,
        })),
      },
      deadlines: upcomingDeadlines,
      checklist,
      employees: {
        total: employees.length,
        totalCerts,
        expiringCerts,
      },
      actionRequired:
        expiredDocs.length +
        expiringDocs.length +
        expiringCerts,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;