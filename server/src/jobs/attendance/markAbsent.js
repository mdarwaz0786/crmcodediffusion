import cron from "node-cron";
import Attendance from "../../models/attendance.model.js";
import Team from "../../models/team.model.js";

// Schedule a task to run every day at 20:00
cron.schedule("0 20 * * *", async () => {
  try {
    const employees = await Team.find();

    if (!employees) {
      return;
    };

    const today = new Date().toISOString().split("T")[0];

    // Loop through each employee
    const updateAttendancePromises = employees.map(async (employee) => {
      const existingAttendance = await Attendance.findOne({
        employee: employee._id,
        attendanceDate: today,
      });

      // If attendance already exists, skip updating or creating a new record
      if (existingAttendance) {
        return;
      };

      // Create a new attendance record with status "Absent"
      await Attendance.create({
        employee: employee._id,
        attendanceDate: today,
        status: "Absent",
        punchInTime: null,
        punchIn: true,
        punchOutTime: null,
        punchOut: true,
        hoursWorked: null,
        lateIn: null,
      });
    });

    // Wait for all attendance updates to be completed
    await Promise.all(updateAttendancePromises);
  } catch (error) {
    console.log("Error while marking attendance as Absent:", error.message);
  };
});
