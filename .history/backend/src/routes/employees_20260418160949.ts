import express from 'express';
import Employee from '../models/Employee';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all employees
router.get('/', protect, async (req: AuthRequest, res) => {
  try {
    const employees = await Employee.find({
      userId: req.userId,
      status: 'active'
    }).sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add employee
router.post('/', protect, async (req: AuthRequest, res) => {
  try {
    const { name, email, phone, role, certifications } = req.body;
    const employee = await Employee.create({
      userId: req.userId,
      name, email, phone, role,
      certifications: certifications || [],
    });
    res.status(201).json(employee);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update employee
router.put('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add certification to employee
router.post('/:id/certifications', protect, async (req: AuthRequest, res) => {
  try {
    const { name, issuedDate, expiryDate, documentUrl } = req.body;
    const employee = await Employee.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    employee.certifications.push({
      name, issuedDate, expiryDate,
      status: 'active',
      documentUrl,
    });
    await employee.save();
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete employee
router.delete('/:id', protect, async (req: AuthRequest, res) => {
  try {
    await Employee.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { status: 'inactive' }
    );
    res.json({ message: 'Employee removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;