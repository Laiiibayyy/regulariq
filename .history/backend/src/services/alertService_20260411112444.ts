import { ComplianceItem } from '../models/ComplianceItem';
import { User } from '../models/User';
import sgMail from '@sendgrid/mail';
import twilio from 'twilio';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
const twilioClient = twilio(process.env.TWILIO_SID!, process.env.TWILIO_AUTH_TOKEN!);

export class AlertService {
  async checkAndSendAlerts() {
    const today = new Date();
    const alertDays = [90, 60, 30, 14, 7, 1];

    for (const days of alertDays) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + days);
      
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const expiringItems = await ComplianceItem.find({
        expiryDate: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: { $nin: ['renewed', 'verified'] }
      }).populate('businessId');

      for (const item of expiringItems) {
        const business = item.businessId as any;
        const user = await User.findById(business.userId);
        
        if (!user) continue;

        // Check if alert already sent
        const alertAlreadySent = item.alertHistory.some(
          h => h.daysBefore === days && 
               h.sentAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        if (alertAlreadySent) continue;

        const regulation = await (item as any).populate('regulationId');
        const message = `⚠️ ${regulation.regulationId.title} expires in ${days} days! Log in to RegularIQ to renew.`;

        // Send email
        if (user.preferences.emailAlerts) {
          await sgMail.send({
            to: user.email,
            from: 'alerts@regulariq.com',
            subject: `Compliance Alert: ${days} day reminder`,
            text: message,
            html: `<strong>${message}</strong><br/><br/><a href="https://app.regulariq.com/compliance/${item._id}">View Details</a>`
          });
        }

        // Send SMS
        if (user.preferences.smsAlerts && user.preferences.phoneNumber) {
          await twilioClient.messages.create({
            body: message,
            to: user.preferences.phoneNumber,
            from: process.env.TWILIO_PHONE!
          });
        }

        // Record alert
        item.alertHistory.push({
          daysBefore: days,
          channel: 'email',
          sentAt: new Date()
        });
        
        if (user.preferences.smsAlerts) {
          item.alertHistory[item.alertHistory.length - 1].channel = 'both';
        }
        
        await item.save();
      }
    }
  }
}