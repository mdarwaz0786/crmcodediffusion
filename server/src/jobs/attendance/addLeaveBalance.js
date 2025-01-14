import cron from "node-cron";
import Team from "../../models/team.model.js";

// Schedule a task to run on the first day of each month at 12:00 AM
cron.schedule("0 0 1 * *", async () => {
  try {
    const employees = await Team.find();

    if (!employees) {
      return;
    };

    // Loop through each employee
    const updateLeaveBalancePromises = employees.map(async (employee) => {
      try {
        employee.leaveBalance = parseFloat(employee.leaveBalance) + 2;
        await employee.save();
      } catch (error) {
        console.log(`Error while updating leave balance for employee ${employee.name}:`, error.message);
      };
    });

    // Wait for all leave balance updates to be completed
    await Promise.all(updateLeaveBalancePromises);

    console.log("Monthly leave balance updated successfully.");
  } catch (error) {
    console.log("Error while updating monthly leave balance:", error.message);
  };
});
