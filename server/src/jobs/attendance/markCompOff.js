import cron from "node-cron";
import mongoose from "mongoose";
import Attendance from "../../models/attendance.model.js";
import Team from "../../models/team.model.js";

// Schedule a task to run every day at 19:00
cron.schedule("00 19 * * *", async () => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const employees = await Team
      .find()
      .select("_id name eligibleCompOffDate");

    if (!employees || employees.length === 0) {
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
      const compOffIndex = employee?.eligibleCompOffDate?.findIndex((compOff) =>
        compOff?.compOffDate === today &&
        compOff?.isApplied === true &&
        compOff?.isApproved === true
      );

      if (compOffIndex !== -1) {
        const existingAttendance = await Attendance.findOne({
          employee: employee?._id,
          attendanceDate: today,
        });

        // If attendance already exists, skip creation
        if (existingAttendance) {
          return;
        };

        // Create a new attendance record with status Comp Off
        await Attendance.create([{
          employee: employee?._id,
          attendanceDate: today,
          status: "Comp Off",
          punchInTime: null,
          punchIn: false,
          punchOutTime: null,
          punchOut: false,
          hoursWorked: "",
          lateIn: "",
        }], { session });
      };
    });

    // Wait for all task to be completed
    await Promise.all(updateAttendancePromises);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
  } finally {
    session.endSession();
  };
}, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});
