import cron from "node-cron";
import Attendance from "../../models/attendance.model.js";
import Team from "../../models/team.model.js";
import Holiday from "../../models/holiday.model.js";

// Schedule a task to run every day at 20:00
cron.schedule("0 20 * * *", async () => {
  try {
    const employees = await Team.find();

    if (!employees) {
      return;
    };

    const holidays = await Holiday.find({ date: new Date().toISOString().split("T")[0] });

    if (!holidays) {
      return;
    };

    const today = new Date().toISOString().split("T")[0];

    // Loop through each employee
    const updateAttendancePromises = employees.map(async (employee) => {
      const existingAttendance = await Attendance.findOne({
        employee: employee._id,
        attendanceDate: today,
      });

      // If attendance already exists, skip creation
      if (existingAttendance) {
        return;
      };

      // Create a new attendance record with status Holiday
      await Attendance.create({
        employee: employee._id,
        attendanceDate: today,
        status: "Holiday",
        punchInTime: null,
        punchIn: false,
        punchOutTime: null,
        punchOut: false,
        hoursWorked: "00:00",
        lateIn: "00:00",
      });
    });

    // Wait for all attendance marked as Holiday
    await Promise.all(updateAttendancePromises);
  } catch (error) {
    console.log("Error while marking attendance as holiday:", error.message);
  };
});
