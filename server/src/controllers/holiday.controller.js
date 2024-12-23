import Holiday from "../models/holiday.model.js";
import Attendance from "../models/attendance.model.js";
import Team from "../models/team.model.js";

// Create a new holiday
export const createHoliday = async (req, res) => {
  try {
    const { reason, type, date } = req.body;

    if (!reason || !type || !date) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    };

    // Check if a holiday already exists for the given date
    const existingHoliday = await Holiday.findOne({ date });

    if (existingHoliday) {
      // Update the existing holiday
      existingHoliday.reason = reason;
      existingHoliday.type = type;
      await existingHoliday.save();
    } else {
      // Create a new holiday
      const holiday = new Holiday({ reason, type, date });
      await holiday.save();
    };

    // Get all employees
    const employees = await Team.find();

    if (!employees || employees.length === 0) {
      return res.status(404).json({ success: false, message: "No employees found" });
    };

    // Update attendance records for all employees
    const updateAttendancePromises = employees.map(async (employee) => {
      const existingAttendance = await Attendance.findOne({
        employee: employee._id,
        attendanceDate: date,
      });

      if (existingAttendance) {
        // Update existing attendance record
        existingAttendance.status = type;
        existingAttendance.punchInTime = null;
        existingAttendance.punchOutTime = null;
        existingAttendance.hoursWorked = null;
        existingAttendance.punchIn = true;
        existingAttendance.punchOut = true;
        await existingAttendance.save();
      } else {
        // Create a new attendance record
        const attendance = new Attendance({
          employee: employee._id,
          attendanceDate: date,
          status: type,
          punchInTime: null,
          punchIn: true,
          punchOutTime: null,
          punchOut: true,
          hoursWorked: null,
          lateIn: null,
        });
        await attendance.save();
      };
    });

    // Wait for all attendance updates to be completed
    await Promise.all(updateAttendancePromises);

    res.status(200).json({ success: true, message: "Holiday and attendance created successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: error.message });
  };
};

// Get all upcoming holidays
export const fetchUpcomingHoliday = async (req, res) => {
  try {
    // Get the current date
    const currentDate = new Date().toISOString().split("T")[0];

    // Find all holidays with a date greater than or equal to the current date
    const holiday = await Holiday.find({ date: { $gte: currentDate } })
      .sort({ date: 1 })
      .exec();

    res.status(200).json({ success: true, holiday });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: error.message });
  };
};

// Get all holidays
export const fetchAllHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.find();
    res.status(200).json({ successs: true, holiday });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  };
};

// Get a single holiday by ID
export const fetchSingleHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const holiday = await Holiday.findById(id);

    if (!holiday) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    };
    res.status(200).json({ success: true, holiday });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  };
};

// Update a holiday
export const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, type, date } = req.body;

    if (!reason || !type || !date) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    };

    // Find the existing holiday
    const holiday = await Holiday.findById(id);

    if (!holiday) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    };

    // Check if the date has changed
    const isDateChanged = holiday.date !== date;

    // Get all employees
    const employees = await Team.find();

    if (!employees || employees.length === 0) {
      return res.status(404).json({ success: false, message: "No employees found" });
    };

    if (isDateChanged) {
      // Update or create attendance records for the new date
      const updateAttendancePromises = employees.map(async (employee) => {
        const existingAttendance = await Attendance.findOne({
          employee: employee._id,
          attendanceDate: holiday.date,
        });

        if (existingAttendance) {
          // Update existing attendance record
          existingAttendance.status = type;
          existingAttendance.punchInTime = null;
          existingAttendance.punchOutTime = null;
          existingAttendance.hoursWorked = null;
          existingAttendance.punchIn = true;
          existingAttendance.punchOut = true;
          return existingAttendance.save();
        } else {
          // Create a new attendance record
          const attendance = new Attendance({
            employee: employee._id,
            attendanceDate: date,
            status: type,
            punchInTime: null,
            punchIn: true,
            punchOutTime: null,
            punchOut: true,
            hoursWorked: null,
            lateIn: null,
          });
          return attendance.save();
        };
      });

      // Wait for all attendance updates/creations to be completed
      await Promise.all(updateAttendancePromises);
    };

    // Update the holiday details
    holiday.reason = reason;
    holiday.type = type;
    holiday.date = date;
    await holiday.save();

    res.status(200).json({ success: true, message: "Holiday updated successfully", holiday });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  };
};

// Delete a holiday
export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Holiday id is required" });
    };

    // Find the holiday by ID
    const holiday = await Holiday.findById(id);

    if (!holiday) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    };

    // Extract the holiday date
    const { date } = holiday;

    // Delete the holiday
    await Holiday.deleteOne({ _id: id });

    // Delete all attendance records for the holiday date
    await Attendance.deleteMany({ attendanceDate: date, status: "Holiday", });

    res.status(200).json({ success: true, message: "Holiday and associated attendance records deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  };
};