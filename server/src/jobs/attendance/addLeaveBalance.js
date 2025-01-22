import cron from "node-cron";
import Team from "../../models/team.model.js";

// Schedule a task to run on the first day of each month at 12:00 AM
cron.schedule("0 0 1 * *", async () => {
  try {
    const employees = await Team.find();

    if (!employees || employees.length === 0) {
      return;
    };

    // Loop through each employee
    const updateLeaveBalancePromises = employees.map(async (employee) => {
      try {
        employee.currentLeaveBalance = parseFloat(employee?.currentLeaveBalance) + 2;
        await employee.save();
      } catch (error) {
        console.log(`Error while updating current leave balance for all employee`, error.message);
      };
    });

    // Wait for all current leave balance updates to be completed
    await Promise.all(updateLeaveBalancePromises);
  } catch (error) {
    console.log("Error while updating monthly current leave balance:", error.message);
  };
});
