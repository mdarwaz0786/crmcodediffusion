import cron from "node-cron";
import Attendance from "../../models/attendance.model.js";
import Team from "../../models/team.model.js";

// Schedule a task to run every day at 19:30
cron.schedule("30 19 * * *", async () => {
  try {
    const employees = await Team
      .find()
      .select("_id name");

    if (!employees || employees.length === 0) {
      return;
    };

    const today = new Date().toISOString().split("T")[0];

    // Loop through each emplyee
    const updateAttendancePromises = employees?.map(async (employee) => {
      try {
        const existingAttendance = await Attendance.findOne({
          employee: employee?._id,
          attendanceDate: today,
        });

        // Skip if attendance already exists, skip creation
        if (existingAttendance) {
          return;
        };

        // Create a new attendance record with status Absent
        await Attendance.create({
          employee: employee?._id,
          attendanceDate: today,
          status: "Absent",
          punchInTime: null,
          punchIn: false,
          punchOutTime: null,
          punchOut: false,
          hoursWorked: "",
          lateIn: "",
        });
      } catch (error) {
        console.log(`Error while marking atendance as Absent for employee ${employee?.name}:`, error.message);
      };
    });

    // Wait for all task to be completed
    await Promise.all(updateAttendancePromises);
  } catch (error) {
    console.log("Error while marking attendance as Absent:", error.message);
  };
});
