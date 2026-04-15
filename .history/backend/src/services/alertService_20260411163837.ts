import { ComplianceItem } from '../models/ComplianceItem';
import { User } from '../models/User';
import { Regulation } from '../models/Regulation';
import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Only initialize if API keys are present
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const twilioClient = process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export class AlertService {
  async checkAndSendAlerts() {
    try {
      const today = new Date();
      const alertDays = [90, 60, 30, 14, 7, 1];

      for (const days of alertDays) {
        const targetDate = new Date();
        targetDate.setDate(today.getDate() + days);
        
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Find expiring items
        const expiringItems = await ComplianceItem.find({
          expiryDate: {
            $gte: startOfDay,
            $lte: endOfDay
          },
          status: { $nin: ['renewed', 'verified'] }
        }).populate('businessId');

        for (const item of expiringItems) {
          try {
            // Get business and user
            const business = item.businessId as any;
            if (!business || !business.userId) continue;
            
            const user = await User.findById(business.userId);
            if (!user) continue;

            // Check if alert already sent
            const alertAlreadySent = item.alertHistory?.some(
              (h: any) => h.daysBefore === days && 
                   h.sentAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
            );

            if (alertAlreadySent) continue;

            // Get regulation details - FIXED: item.regulationId not item.regulationId.title
            const regulation = await Regulation.findById(item.regulationId);
            if (!regulation) continue;

            const message = `⚠️ ${regulation.title} expires in ${days} days! Log in to RegularIQ to renew.`;

            // Send email
            if (user.preferences?.emailAlerts && process.env.SENDGRID_API_KEY) {
              try {
                await sgMail.send({
                  to: user.email,
                  from: 'alerts@regulariq.com',
                  subject: `Compliance Alert: ${days} day reminder`,
                  text: message,
                  html: `<strong>${message}</strong><br/><br/><a href="https://app.regulariq.com/compliance/${item._id}">View Details</a>`
                });
              } catch (emailError) {
                console.error('Failed to send email:', emailError);
              }
            }

            // Send SMS
            if (user.preferences?.smsAlerts && user.preferences?.phoneNumber && twilioClient) {
              try {
                await twilioClient.messages.create({
                  body: message,
                  to: user.preferences.phoneNumber,
                  from: process.env.TWILIO_PHONE!
                });
              } catch (smsError) {
                console.error('Failed to send SMS:', smsError);
              }
            }

            // Record alert
            if (!item.alertHistory) {
              item.alertHistory = [];
            }
            
            item.alertHistory.push({
              daysBefore: days,
              channel: user.preferences?.smsAlerts ? 'both' : 'email',
              sentAt: new Date(),
              status: 'sent'
            });
            
            await item.save();
            
          } catch (itemError) {
            console.error(`Error processing item ${item._id}:`, itemError);
          }
        }
      }
    } catch (error) {
      console.error('Alert service error:', error);
    }
  }

  // Method to send single alert (for testing)
  async sendTestAlert(userId: string, message: string) {
    try {
      const user = await User.findById(userId);
      if (!user) return false;

      if (user.preferences?.emailAlerts && process.env.SENDGRID_API_KEY) {
        await sgMail.send({
          to: user.email,
          from: 'alerts@regulariq.com',
          subject: 'Test Alert from RegularIQ',
          text: message,
          html: `<strong>${message}</strong>`
        });
      }

      if (user.preferences?.smsAlerts && user.preferences?.phoneNumber && twilioClient) {
        await twilioClient.messages.create({
          body: message,
          to: user.preferences.phoneNumber,
          from: process.env.TWILIO_PHONE!
        });
      }

      return true;
    } catch (error) {
      console.error('Test alert failed:', error);
      return false;
    }
  }
}