import cron from "node-cron";
import Attendance from "../../models/attendance.model.js";
import Team from "../../models/team.model.js";
import Holiday from "../../models/holiday.model.js";

// Schedule a task to run every day at 18:30
cron.schedule("30 18 * * *", async () => {
  try {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const holidays = await Holiday
      .find({ date: today });

    if (!holidays || holidays.length === 0) {
      return;
    };

    const employees = await Team
      .find({ isActive: true })
      .select("_id name");

    if (!employees || employees.length === 0) {
      return;
    };

    // Loop through each employee
    const updateAttendancePromises = employees?.map(async (employee) => {
      try {
        const existingAttendance = await Attendance.findOne({
          employee: employee?._id,
          attendanceDate: today,
        });

        // If attendance already exists, skip
        if (existingAttendance) {
          return;
        };

        // Create a new attendance record with status Holiday
        await Attendance.create({
          employee: employee?._id,
          attendanceDate: today,
          status: "Holiday",
          punchInTime: null,
          punchIn: false,
          punchOutTime: null,
          punchOut: false,
          hoursWorked: "",
          lateIn: "",
        });
      } catch (error) {
        console.log(`Error while marking attendance as Holiday for employee ${employee?.name}:`, error.message);
      };
    });

    // Wait for all task to be completed
    await Promise.all(updateAttendancePromises);
  } catch (error) {
    console.log("Error while marking attendance as Holiday:", error.message);
  };
}, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});
