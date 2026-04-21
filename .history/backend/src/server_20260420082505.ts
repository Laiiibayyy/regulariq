import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import businessRoutes from './routes/business';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);

// MongoDB Connect
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
import { startAlertJob } from './jobs/alertJob';

// MongoDB connect ke baad
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('✅ MongoDB Connected');
    startAlertJob(); // ← yeh add karo
  });
  import stripeRoutes from './routes/stripe';

// Webhook raw body ke liye — ROUTES SE PEHLE
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Baaki routes
app.use('/api/stripe', stripeRoutes);

import documentRoutes from './routes/documents';
app.use('/api/documents', documentRoutes);

import scoreRoutes from './routes/score';
app.use('/api/score', scoreRoutes);

import employeeRoutes from './routes/employees';
app.use('/api/employees', employeeRoutes);

import auditRoutes from './routes/audit';
app.use('/api/audit', auditRoutes);

import dashboardRoutes from './routes/dashboard';
app.use('/api/dashboard', dashboardRoutes);