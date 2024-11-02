// scheduler.js
import cron from 'node-cron';
import dotenv from "dotenv";
import ProjectDeployment from '../../models/projectDeployment.model.js';
import { sendEmail } from '../../services/emailService.js';

// Dotenv configuration
dotenv.config();

// Schedule a task to run every day at 9 AM
cron.schedule('30 12 * * *', async () => {
  try {
    const notifications = await ProjectDeployment.find({
      $or: [
        { domainExpireIn: '30 Days' },
        { domainExpireIn: '15 Days' },
        { domainExpireIn: '7 Days' },
        { domainExpiryStatus: 'Expired' },
      ],
    });

    notifications.forEach(async (project) => {
      let subject = '';
      let htmlContent = '';

      if (project.domainExpiryStatus === 'Expired') {
        subject = `Domain Expired: ${project.websiteName}`;
        htmlContent = `<p>Your domain <strong>${project.websiteName}</strong> has expired. Please renew it as soon as possible.</p>`;
      } else {
        subject = `Domain Expiration Notice: ${project.websiteName}`;
        htmlContent = `<p>Your domain <strong>${project.websiteName}</strong> will expire in ${project.domainExpireIn}. Please take necessary actions to renew it.</p>`;
      };

      // Send email to two receivers
      await sendEmail(process.env.FIRST_RECEIVER_EMAIL_ID, subject, htmlContent);
      await sendEmail(process.env.SECOND_RECEIVER_EMAIL_ID, subject, htmlContent);
    });
  } catch (error) {
    console.error('Error during schedulingtask:', error.message);
  };
});
