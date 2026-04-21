import cron from 'node-cron';
import mongoose from 'mongoose';
import User from '../models/User';
import Document from '../models/Document';
import { sendDeadlineAlert } from '../services/emailService';

export const startAlertJob = () => {
  // Har raat 9 baje chalega
  cron.schedule('0 9 * * *', async () => {
    console.log('🔔 Running nightly alert job...');

    try {
      const docs = await Document.find({ status: 'active' }).populate('userId');

      for (const doc of docs) {
        const user = await User.findById(doc.userId);
        if (!user) continue;

        const daysLeft = Math.ceil(
          (new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        // Alert thresholds: 90, 60, 30, 14, 7, 1
        const alertDays = [90, 60, 30, 14, 7, 1];

        if (alertDays.includes(daysLeft)) {
          await sendDeadlineAlert(
            user.email,
            user.name,
            doc.fileName,
            daysLeft,
            new Date(doc.expiryDate).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })
          );
          console.log(`✅ Alert sent to ${user.email} — ${daysLeft} days left`);
        }
      }
    } catch (err) {
      console.error('❌ Alert job error:', err);
    }
  });

  console.log('✅ Alert job scheduled');
};

