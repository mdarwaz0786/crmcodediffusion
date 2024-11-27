import cron from "node-cron";
import Attendance from "../../models/attendance.model.js";
import Team from "../../models/team.model.js";

// Schedule a task to run every Sunday at 10:00 AM
cron.schedule("0 10 * * 0", async () => {
  try {
    // Get all employees from the Team model
    const employees = await Team.find();

    if (employees.length === 0) {
      console.log("No employees found to mark attendance.");
      return;
    };

    // Today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Update or create attendance records for each employee
    for (const employee of employees) {
      const existingAttendance = await Attendance.findOne({
        employee: employee._id,
        attendanceDate: today,
      });

      if (existingAttendance) {
        // Update the existing attendance record
        existingAttendance.status = "Sunday";
        await existingAttendance.save();
      } else {
        // Create a new attendance record
        const newAttendance = new Attendance({
          employee: employee._id,
          attendanceDate: today,
          status: "Sunday",
        });
        await newAttendance.save();
      };
    };
  } catch (error) {
    console.error("Error while marking attendance as Sunday:", error.message);
  };
});
