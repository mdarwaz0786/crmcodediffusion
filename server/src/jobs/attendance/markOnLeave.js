import cron from "node-cron";
import mongoose from "mongoose";
import Attendance from "../../models/attendance.model.js";
import Team from "../../models/team.model.js";

// Schedule a task to run every day at 19:15
cron.schedule("15 19 * * *", async () => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const employees = await Team
      .find()
      .select("_id name currentLeaveBalance usedLeaveBalance approvedLeaves");

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
      const leaveIndex = employee?.approvedLeaves?.findIndex((leave) => leave?.date === today);

      if (leaveIndex !== -1) {
        // Create a new attendance record with status On Leave
        const existingAttendance = await Attendance.findOne({
          employee: employee?._id,
          attendanceDate: today,
        }).session(session);

        // Skip if attendance already exists
        if (!existingAttendance) {
          await Attendance.create(
            [{
              employee: employee?._id,
              attendanceDate: today,
              status: "On Leave",
              punchInTime: null,
              punchIn: false,
              punchOutTime: null,
              punchOut: false,
              hoursWorked: "",
              lateIn: "",
            }], { session },
          );
        };

        employee.currentLeaveBalance = (parseFloat(employee?.currentLeaveBalance) - 1).toString();
        employee.usedLeaveBalance = (parseFloat(employee?.usedLeaveBalance) + 1).toString();

        await employee.save({ session });
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
