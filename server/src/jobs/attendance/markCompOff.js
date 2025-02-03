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

    const today = new Date().toISOString().split("T")[0];

    // Loop through each employee
    const updateAttendancePromises = employees?.map(async (employee) => {
      const compOffIndex = employee?.eligibleCompOffDate?.findIndex((compOff) =>
        compOff?.date === today &&
        compOff?.isApplied === true &&
        compOff?.isApproved === true &&
        compOff?.isUtilized === false
      );

      if (compOffIndex !== -1) {
        employee.eligibleCompOffDate[compOffIndex].isUtilized = true;
        employee.eligibleCompOffDate[compOffIndex].utilizedDate = today;

        await employee.save({ session });

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
    console.log("Error while marking attendance as Comp Off:", error.message);
    await session.abortTransaction();
  } finally {
    session.endSession();
  };
});
