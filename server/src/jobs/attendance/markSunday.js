import cron from "node-cron";
import Attendance from "../../models/attendance.model.js";
import Team from "../../models/team.model.js";

// Schedule a task to run every Sunday at 18:45
cron.schedule("45 18 * * 0", async () => {
  try {
    const employees = await Team
      .find({ isActive: true })
      .select("_id name");;

    if (!employees || employees?.length === 0) {
      return;
    };

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

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

        // Create a new attendance record with status Sunday
        await Attendance.create({
          employee: employee?._id,
          attendanceDate: today,
          status: "Sunday",
          punchInTime: null,
          punchIn: false,
          punchOutTime: null,
          punchOut: false,
          hoursWorked: "",
          lateIn: "",
        });
      } catch (error) {
        console.log(`Error while marking attendance as Sunaday for employee ${employee?.name}:`, error.message);
      };
    });

    // Wait for all task to be completed
    await Promise.all(updateAttendancePromises);
  } catch (error) {
    console.log("Error while marking attendance as Sunday:", error.message);
  };
}, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});
