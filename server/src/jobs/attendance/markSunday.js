import cron from "node-cron";
import Attendance from "../../models/attendance.model.js";
import Team from "../../models/team.model.js";

// Schedule a task to run every Sunday at 10:00 AM
cron.schedule("0 10 * * 0", async () => {
  try {
    // Get all employees from the Team model
    const employees = await Team.find();

    if (!employees || employees.length === 0) {
      return;
    };

    const today = new Date().toISOString().split("T")[0];

    // Update attendance records for all employees
    const updateAttendancePromises = employees.map(async (employee) => {
      // Update if exists otherwise create new attendance record
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
        {
          upsert: true,
          new: true,
        },
      );
    });

    // Wait for all attendance updates/creations to complete
    await Promise.all(updateAttendancePromises);
  } catch (error) {
    console.log("Error while marking attendance as Sunday:", error.message);
  };
});
