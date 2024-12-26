import cron from "node-cron";
import Attendance from "../../models/attendance.model.js";
import Team from "../../models/team.model.js";

// Schedule a task to run every day at 18:30
cron.schedule("48 18 * * *", async () => {
  try {
    // Get all employees from the Team model
    const employees = await Team.find();

    if (!employees || employees.length === 0) {
      return;
    };

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

      // Create or update the attendance record as Absent
      await Attendance.findOneAndUpdate(
        {
          employee: employee._id,
          attendanceDate: today,
        },
        {
          $set: {
            status: "Absent",
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
    console.error("Error while marking attendance as Absent:", error.message);
  };
});
