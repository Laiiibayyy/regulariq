import cron from 'node-cron';
import User from '../models/User';
import DocumentModel from '../models/Document';
import Employee from '../models/Employee';
import { sendDeadlineAlert } from '../services/emailService';

export const startAlertJob = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('🔔 Running nightly alert job...');

    try {
      // ── Document alerts ──
      const docs = await DocumentModel.find({ status: 'active' });

      for (const doc of docs) {
        const user = await User.findById(doc.userId);
        if (!user) continue;

        const daysLeft = Math.ceil(
          (new Date(doc.expiryDate).getTime() - Date.now()) / 86400000
        );

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
          console.log(`✅ Doc alert sent to ${user.email}`);
        }
      }

      // ── Employee cert alerts ──
      const employees = await Employee.find({ status: 'active' });

      for (const emp of employees) {
        const user = await User.findById(emp.userId);
        if (!user) continue;

        for (const cert of emp.certifications) {
          const daysLeft = Math.ceil(
            (new Date(cert.expiryDate).getTime() - Date.now()) / 86400000
          );

          const alertDays = [90, 60, 30, 14, 7, 1];
          if (alertDays.includes(daysLeft)) {
            await sendDeadlineAlert(
              user.email,
              emp.name,
              cert.name,
              daysLeft,
              new Date(cert.expiryDate).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })
            );
            console.log(`✅ Cert alert sent to ${user.email}`);
          }
        }
      }

    } catch (err) {
      console.error('❌ Alert job error:', err);
    }
  });

  console.log('✅ Alert job scheduled — runs daily at 9 AM');
};