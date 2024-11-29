import cron from 'node-cron';
import moment from 'moment';
import ProjectDeployment from '../../models/projectDeployment.model.js';

// Helper function to calculate expiry days and status
const calculateExpiry = (expiryDate) => {
  const currentDate = moment();
  const expirationDate = moment(expiryDate, 'YYYY-MM-DD');
  const daysRemaining = expirationDate.diff(currentDate, 'days');

  return {
    expireIn: daysRemaining > 0 ? `${daysRemaining} Days` : "Expired",
    expiryStatus: daysRemaining > 0 ? "Live" : "Expired",
  };
};

// Running daily at 8 AM to update expiration fields
cron.schedule('0 8 * * *', async () => {
  try {
    console.log("expiry status update runs");
    const projectDeployments = await ProjectDeployment.find();

    if (!projectDeployments || projectDeployments.length === 0) {
      console.log("Project deployments not found");
      return;
    };

    for (const project of projectDeployments) {
      const { domainExpiryDate, hostingExpiryDate, sslExpiryDate } = project;

      // Calculate expiry days and status for each field
      const { expireIn: domainExpireIn, expiryStatus: domainExpiryStatus } = calculateExpiry(domainExpiryDate);
      const { expireIn: hostingExpireIn, expiryStatus: hostingExpiryStatus } = calculateExpiry(hostingExpiryDate);
      const { expireIn: sslExpireIn, expiryStatus: sslExpiryStatus } = calculateExpiry(sslExpiryDate);

      // Update the project deployment with calculated values
      await ProjectDeployment.findByIdAndUpdate(project._id, {
        domainExpireIn,
        domainExpiryStatus,
        hostingExpireIn,
        hostingExpiryStatus,
        sslExpireIn,
        sslExpiryStatus,
      });
    };

  } catch (error) {
    console.error("Error while updating expiration fields:", error.message);
  };
});
