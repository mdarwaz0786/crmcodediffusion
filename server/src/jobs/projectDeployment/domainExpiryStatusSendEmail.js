// scheduler.js
import cron from 'node-cron';
import dotenv from "dotenv";
import ProjectDeployment from '../../models/projectDeployment.model.js';
import { sendEmail } from '../../services/emailService.js';

// Dotenv configuration
dotenv.config();

// Schedule a task to run every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  try {
    const notifications = await ProjectDeployment.find({
      $or: [
        { domainExpireIn: '30 Days' },
        { domainExpireIn: '15 Days' },
        { domainExpireIn: '7 Days' },
        { hostingExpireIn: '30 Days' },
        { hostingExpireIn: '15 Days' },
        { hostingExpireIn: '7 Days' },
        { sslExpireIn: '30 Days' },
        { sslExpireIn: '15 Days' },
        { sslExpireIn: '7 Days' },
        { domainExpiryStatus: 'Expired', domainExpiryNotified: false },
        { hostingExpiryStatus: 'Expired', hostingExpiryNotified: false },
        { sslExpiryStatus: 'Expired', sslExpiryNotified: false },
      ],
    });

    notifications.forEach(async (project) => {
      let subject = '';
      let htmlContent = '';

      // Domain expiration notification
      if (project.domainExpiryStatus === 'Expired' && !project.domainExpiryNotified) {
        subject = `Domain Expired: ${project.websiteName}`;
        htmlContent = `<p>Your domain <strong>${project.websiteName}</strong> has expired. Please renew it as soon as possible.</p>`;

        // Mark domain notification as sent
        project.domainExpiryNotified = true;
      } else if (['30 Days', '15 Days', '7 Days'].includes(project.domainExpireIn)) {
        subject = `Domain Expiration Notice: ${project.websiteName}`;
        htmlContent = `<p>Your domain <strong>${project.websiteName}</strong> will expire in ${project.domainExpireIn}. Please take necessary actions to renew it.</p>`;
      };

      // Hosting expiration notification
      if (project.hostingExpiryStatus === 'Expired' && !project.hostingExpiryNotified) {
        subject = `Hosting Expired: ${project.websiteName}`;
        htmlContent += `<p>Your hosting for <strong>${project.websiteName}</strong> has expired. Please renew it to avoid interruptions.</p>`;

        // Mark hosting notification as sent
        project.hostingExpiryNotified = true;
      } else if (['30 Days', '15 Days', '7 Days'].includes(project.hostingExpireIn)) {
        subject = `Hosting Expiration Notice: ${project.websiteName}`;
        htmlContent += `<p>Your hosting for <strong>${project.websiteName}</strong> will expire in ${project.hostingExpireIn}. Please ensure timely renewal.</p>`;
      };

      // SSL expiration notification
      if (project.sslExpiryStatus === 'Expired' && !project.sslExpiryNotified) {
        subject = `SSL Certificate Expired: ${project.websiteName}`;
        htmlContent += `<p>The SSL certificate for <strong>${project.websiteName}</strong> has expired. Please renew it to maintain secure access.</p>`;

        // Mark SSL notification as sent
        project.sslExpiryNotified = true;
      } else if (['30 Days', '15 Days', '7 Days'].includes(project.sslExpireIn)) {
        subject = `SSL Expiration Notice: ${project.websiteName}`;
        htmlContent += `<p>The SSL certificate for <strong>${project.websiteName}</strong> will expire in ${project.sslExpireIn}. Please renew it to keep your site secure.</p>`;
      };

      // Send email to receivers if there is a notification
      if (subject && htmlContent) {
        await sendEmail(project.client.email, subject, htmlContent);
        await sendEmail(process.env.RECEIVER_EMAIL_ID, subject, htmlContent);

        // Save the updated notification flags
        await project.save();
      };
    });

  } catch (error) {
    console.error('Error during scheduling task:', error.message);
  };
});
