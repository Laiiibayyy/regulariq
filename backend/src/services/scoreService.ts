import DocumentModel from '../models/Document';
import ComplianceScore from '../models/ComplianceScore';
import Business from '../models/Buisness';

const CATEGORY_WEIGHTS = {
  license:     30,
  permit:      25,
  certificate: 20,
  insurance:   15,
  general:     10,
};

const REQUIRED_DOCS_BY_TYPE: Record<string, string[]> = {
  restaurant:   ['license', 'permit', 'certificate', 'insurance'],
  clinic:       ['license', 'permit', 'certificate', 'insurance'],
  retail:       ['license', 'permit', 'insurance'],
  construction: ['license', 'permit', 'certificate', 'insurance'],
};

export const calculateScore = async (userId: string): Promise<number> => {
  const business = await Business.findOne({ userId });
  const docs = await DocumentModel.find({ userId, status: 'active' });

  const businessType = business?.type || 'restaurant';
  const requiredCategories = REQUIRED_DOCS_BY_TYPE[businessType] || ['license', 'permit'];

  let totalWeight = 0;
  let earnedWeight = 0;

  for (const category of requiredCategories) {
    const weight = CATEGORY_WEIGHTS[category as keyof typeof CATEGORY_WEIGHTS] || 10;
    totalWeight += weight;

    const doc = docs.find(d => d.category === category);
    if (doc) {
      if (!doc.expiryDate) {
        earnedWeight += weight;
      } else {
        const daysLeft = Math.ceil(
          (new Date(doc.expiryDate).getTime() - Date.now()) / 86400000
        );
        if (daysLeft > 30) earnedWeight += weight;
        else if (daysLeft > 0) earnedWeight += weight * 0.5;
      }
    }
  }

  const score = totalWeight > 0
    ? Math.round((earnedWeight / totalWeight) * 100)
    : 0;

  // Breakdown calculate karo
  const breakdown = {
    licenses:  getBreakdown(docs, 'license'),
    permits:   getBreakdown(docs, 'permit'),
    safety:    getBreakdown(docs, 'certificate'),
    insurance: getBreakdown(docs, 'insurance'),
    employee:  getBreakdown(docs, 'general'),
  };

  // Save/update score
  const existing = await ComplianceScore.findOne({ userId });
  if (existing) {
    existing.history.push({ score: existing.score, date: new Date() });
    if (existing.history.length > 12) existing.history.shift();
    existing.score = score;
    existing.breakdown = breakdown;
    existing.completedItems = docs.length;
    await existing.save();
  } else {
    await ComplianceScore.create({
      userId,
      score,
      breakdown,
      totalItems: requiredCategories.length,
      completedItems: docs.length,
      history: [{ score, date: new Date() }],
    });
  }

  // Business model mein bhi update karo
  await Business.findOneAndUpdate({ userId }, { complianceScore: score });

  return score;
};

const getBreakdown = (docs: any[], category: string): number => {
  const doc = docs.find(d => d.category === category);
  if (!doc) return 0;
  if (!doc.expiryDate) return 100;
  const daysLeft = Math.ceil(
    (new Date(doc.expiryDate).getTime() - Date.now()) / 86400000
  );
  if (daysLeft > 30) return 100;
  if (daysLeft > 0) return 50;
  return 0;
};