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
      return res.status(400).json({ success: false, message: "A holiday already exists for the given date." });
    };

    // Create a new holiday
    const holiday = new Holiday({
      reason,
      type,
      date,
    });

    // Save holiday
    await holiday.save();

    // Get all employees
    const employees = await Team.find();

    if (!employees || employees.length === 0) {
      console.log("No employees found.");
      return;
    };

    // Update attendance records for all employees for the holiday date
    const updateAttendancePromises = employees.map(async (employee) => {
      const existingAttendance = await Attendance.findOne({
        employee: employee._id,
        attendanceDate: date,
      });

      // If attendance already exists for the given date for that employee, skip
      if (existingAttendance) {
        return;
      };

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

      // Save attendance
      await attendance.save();
    });

    // Wait for all attendance updates to be completed
    await Promise.all(updateAttendancePromises);

    res.status(201).json({ success: true, data: holiday });
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
    res.status(200).json({ data: holiday });
  } catch (error) {
    res.status(500).json({ success: true, error: error.message });
  };
};

// Update a holiday
export const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, type, date } = req.body;

    const holiday = await Holiday.findByIdAndUpdate(
      id,
      { reason, type, date },
      { new: true, runValidators: true }
    );

    if (!holiday) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    };
    res.status(200).json({ success: true, message: "Holiday updated successfully", holiday });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  };
};

// Delete a holiday
export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const holiday = await Holiday.findByIdAndDelete(id);
    if (!holiday) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    };
    res.status(200).json({ success: true, message: "Holiday deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  };
};
