import cron from "node-cron";
import Attendance from "../../models/attendance.model.js";
import Team from "../../models/team.model.js";

// Schedule a task to run every Sunday at 10:00 AM
cron.schedule("0 10 * * 0", async () => {
  try {
    // Get all employees from the Team model
    const employees = await Team.find();

    if (!employees || employees.length === 0) {
      console.log("No employees found.");
      return;
    };

    // Today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Update attendance records for all employees who have not punched in
    const updateAttendancePromises = employees.map(async (employee) => {
      const existingAttendance = await Attendance.findOne({
        employee: employee._id,
        attendanceDate: today,
      });

      // If attendance already exists and the employee has punched in, skip
      if (existingAttendance && existingAttendance.punchIn) {
        return;
      };

      // Create or update the attendance record as Sunday
      await Attendance.findOneAndUpdate(
        {
          employee: employee._id,
          attendanceDate: today,
        },
        {
          $set: {
            status: "Sunday",
            punchInTime: null,
            punchIn: true,
            punchOutTime: null,
            punchOut: true,
            hoursWorked: null,
            lateIn: null,
          },
        },
        { upsert: true },
      );
    });

    // Wait for all attendance updates to be completed
    await Promise.all(updateAttendancePromises);
  } catch (error) {
    console.error("Error while marking attendance as Sunday:", error.message);
  };
});
