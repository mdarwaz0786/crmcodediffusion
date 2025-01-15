import cron from "node-cron";
import Attendance from "../../models/attendance.model.js";
import Team from "../../models/team.model.js";

// Schedule a task to run every Sunday at 20:00
cron.schedule("0 20 * * 0", async () => {
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

      // If attendance already exists, skip creation
      if (existingAttendance) {
        return;
      };

      // Create a new attendance record with status "Sunday"
      await Attendance.create({
        employee: employee._id,
        attendanceDate: today,
        status: "Sunday",
        punchInTime: null,
        punchIn: false,
        punchOutTime: null,
        punchOut: false,
        hoursWorked: "00:00",
        lateIn: "00:00",
      });
    });

    // Wait for all attendance creations to complete
    await Promise.all(updateAttendancePromises);
  } catch (error) {
    console.log("Error while marking attendance as Sunday:", error.message);
  };
});
