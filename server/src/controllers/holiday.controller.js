import Holiday from "../models/holiday.model.js";
import Attendance from "../models/attendance.model.js";
import Team from "../models/team.model.js";
import moment from "moment";

// Add a new holiday and mark attendance as holiday with name for all employees
export const createHoliday = async (req, res) => {
  try {
    const { name, date } = req.body;

    // Check if the holiday already exists
    const existingHoliday = await Holiday.findOne({ date });

    if (existingHoliday) {
      return res.status(400).json({ success: false, message: "Holiday already exists on this date." });
    };

    // Create new holiday
    const newHoliday = new Holiday({ name, date });
    await newHoliday.save();

    // Fetch all employees
    const employees = await Team.find();

    // Iterate over each employee and mark attendance as holiday with name
    for (const employee of employees) {
      const attendance = await Attendance.findOne({ employee: employee._id, date });

      if (attendance) {
        // Update existing attendance to holiday
        attendance.attendance = name;
        attendance.checkInTime = null;
        attendance.checkOutTime = null;
        attendance.totalHoursWorked = null;
        await attendance.save();
      } else {
        // Create a new attendance with holiday name
        const newAttendance = new Attendance({
          employee: employee._id,
          markedBy: req.teamId,
          attendance: name,
          date,
          checkInTime: null,
          checkOutTime: null,
          totalHoursWorked: null,
        });
        await newAttendance.save();
      };
    };

    res.status(201).json({ success: true, message: "Holiday created and attendance marked for all employees." });
  } catch (error) {
    console.log("Error while creating holiday:", error.message);
    res.status(500).json({ success: false, message: "Error while creating holiday.", error: error.message });
  };
};

// Automatically mark Sundays as holiday
export const markSundaysAsHoliday = async () => {
  try {
    // Get the current date
    const today = moment().format("YYYY-MM-DD");

    // Check if today is Sunday
    if (moment().day() === 0) { // 0 is Sunday in moment.js

      // Check if the holiday already exists
      const existingHoliday = await Holiday.findOne({ date: today });
      if (!existingHoliday) {

        // Create new holiday for Sunday
        const newHoliday = new Holiday({ name: "Sunday", date: today });
        await newHoliday.save();

        // Fetch all employees
        const employees = await Team.find();

        // Mark attendance as Holiday for all employees
        for (const employee of employees) {
          const newAttendance = new Attendance({
            employee: employee._id,
            markedBy: null,
            attendance: "Sunday",
            date: today,
            checkInTime: null,
            checkOutTime: null,
            totalHoursWorked: null,
          });
          await newAttendance.save();
        };
      };
    };
  } catch (error) {
    console.log("Error while marking Sundays as holiday:", error.message);
    res.status(500).json({ success: false, message: "Error while marking Sundays as holiday.", error: error.message });
  };
};

