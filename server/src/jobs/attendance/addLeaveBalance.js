import cron from "node-cron";
import Team from "../../models/team.model.js";

// Schedule a task to run on the first day of each month at 12:00 AM
cron.schedule("00 00 01 * *", async () => {
  try {
    const employees = await Team
      .find()
      .select("_id name currentLeaveBalance allotedLeaveBalance leaveBalanceAllotedHistory");

    if (!employees || employees.length === 0) {
      return;
    };

    // Get the current date
    const currentDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    // Loop through each employee
    const updateLeaveBalancePromises = employees?.map(async (employee) => {
      try {
        employee.currentLeaveBalance = (parseFloat(employee?.currentLeaveBalance) + 2).toString();
        employee.allotedLeaveBalance = (parseFloat(employee?.allotedLeaveBalance) + 2).toString();
        employee?.leaveBalanceAllotedHistory?.push({ date: currentDate, alloted: "2" });

        await employee.save();
      } catch (error) {
        console.log(`Error while updating leave balance for employee ${employee?.name}:`, error.message);
      };
    });

    // Wait for all task to be completed
    await Promise.all(updateLeaveBalancePromises);
  } catch (error) {
    console.log("Error while updating leave balance:", error.message);
  };
}, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});
