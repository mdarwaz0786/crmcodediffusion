import Attendance from "../models/attendance.model.js";
import mongoose from "mongoose";
import moment from "moment";

// Utility function to calculate duration between two times
const calculateWorkDuration = (checkInTime, checkOutTime) => {
  const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number);
  const [checkOutHours, checkOutMinutes] = checkOutTime.split(':').map(Number);

  // Convert check-in and check-out times to minutes since midnight
  const checkInTotalMinutes = checkInHours * 60 + checkInMinutes;
  const checkOutTotalMinutes = checkOutHours * 60 + checkOutMinutes;

  // Calculate the difference in minutes
  const durationMinutes = checkOutTotalMinutes - checkInTotalMinutes;

  // Convert the difference into hours and minutes
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return `${hours} hours ${minutes} minutes`;
};

// Create a new attendance
export const createAttendance = async (req, res) => {
  try {
    const { attendance, date, checkInTime, checkOutTime, location } = req.body;
    const teamMemberId = req.teamId;
    let totalHoursWorked = "";
    let lateBy = "";

    // Calculate work duration only if the employee is "Present" or "Half Day"
    if (attendance === "Present" || attendance === "Half Day") {
      if (checkInTime && checkOutTime) {
        totalHoursWorked = calculateWorkDuration(checkInTime, checkOutTime);
        lateBy = calculateWorkDuration("10:00", checkInTime);
      };
    } else {
      checkInTime = null;
      checkOutTime = null;
      totalHoursWorked = null;
      lateBy = null;
    };

    const newAttendance = new Attendance({ employee: teamMemberId, attendance, date, checkInTime, checkOutTime, location, totalHoursWorked, lateBy });
    await newAttendance.save();

    res.status(201).json({ success: true, message: "Attendance created successfully.", attendance: newAttendance });
  } catch (error) {
    console.log("Error while creating attendance:", error.message);
    res.status(500).json({ success: false, message: "Error while creating attendance.", error: error.message });
  };
};

// Helper function to find ObjectId by string in referenced models
const findObjectIdByString = async (modelName, fieldName, searchString) => {
  const Model = mongoose.model(modelName);
  const result = await Model.findOne({ [fieldName]: { $regex: new RegExp(searchString, 'i') } }).select('_id');
  return result ? result._id : null;
};

// Fetch all attendance with pagination and sorting
export const fetchAllAttendance = async (req, res) => {
  try {
    let filter = {};
    let sort = {};

    // Handle universal searching across all fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { attendance: { $regex: searchRegex } },
        { date: { $regex: searchRegex } },
        { employee: await findObjectIdByString('Team', 'name', req.query.search) },
      ];
    };

    // Filter by employee ID
    if (req.query.employee) {
      filter.employee = employee;
    };

    // Filter by month and year
    if (req.query.monthYear) {
      const startOfMonth = moment(monthYear, "YYYY-MM").startOf("month").toDate();
      const endOfMonth = moment(monthYear, "YYYY-MM").endOf("month").toDate();
      filter.date = { $gte: startOfMonth, $lte: endOfMonth };
    };

    // Handle sorting
    if (req.query.sort === "Ascending") {
      sort = { createdAt: 1 };
    } else {
      sort = { createdAt: -1 };
    };

    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch attendance with pagination and sorting
    const attendanceRecords = await Attendance.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({ path: "employee", select: "name" })
      .exec();

    // Calculate total count of attendance
    const totalCount = await Attendance.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All attendance fetched successfully", attendance: attendanceRecords, totalCount });
  } catch (error) {
    console.log("Error while fetching all attendance:", error.message);
    return res.status(500).json({ success: false, message: "Error while fetching all attendance.", error: error.message });
  };
};

// Fetch a single attendance by ID
export const fetchSingleAttendance = async (req, res) => {
  try {
    const attendanceId = req.params.id;
    const attendance = await Attendance.findById(attendanceId)
      .populate({ path: "employee", select: "name" })
      .exec();

    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance not found." });
    };

    res.status(200).json({ success: true, message: "Single attendenace fetched successfully.", attendance });
  } catch (error) {
    console.log("Error while fetching single attendance:", error.message);
    res.status(500).json({ success: false, message: "Error while fetching single attendance.", error: error.message });
  };
};

// Update an attendance by Id
export const updateAttendance = async (req, res) => {
  try {
    const attendanceId = req.params.id;
    const { attendance, date, checkInTime, checkOutTime, location } = req.body;

    const attendanceRecord = await Attendance.findById(attendanceId);
    if (!attendanceRecord) {
      return res.status(404).json({ success: false, message: "Attendance not found." });
    };

    // Update attendance details
    attendanceRecord.attendance = attendance || attendanceRecord.attendance;
    attendanceRecord.date = date || attendanceRecord.date;
    attendanceRecord.location = location || attendanceRecord.location;

    // Recalculate or clear duration based on attendance status
    if (attendanceRecord.attendance === "Present" || attendanceRecord.attendance === "Half Day") {
      if (checkInTime && checkOutTime) {
        attendanceRecord.checkInTime = checkInTime;
        attendanceRecord.checkOutTime = checkOutTime;
        attendanceRecord.totalHoursWorked = calculateWorkDuration(checkInTime, checkOutTime);
        attendanceRecord.lateBy = calculateWorkDuration("10:00", checkInTime);
      };
    } else {
      attendanceRecord.checkInTime = null;
      attendanceRecord.checkOutTime = null;
      attendanceRecord.totalHoursWorked = null;
      attendanceRecord.lateBy = null;
    };

    // Save the updated attendance
    await attendanceRecord.save();
    res.status(200).json({ success: true, message: "Attendance updated successfully.", attendance: attendanceRecord });
  } catch (error) {
    console.log("Error while updating attendance:", error.message);
    res.status(500).json({ success: false, message: "Error while updating attendance.", error: error.message });
  };
};

// Delete an attendance by Id
export const deleteAttendance = async (req, res) => {
  try {
    const attendanceId = req.params.id;
    const attendance = await Attendance.findByIdAndDelete(attendanceId);

    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance not found." });
    };

    res.status(200).json({ success: true, message: "Attendance deleted successfully." });
  } catch (error) {
    console.log("Error while deleting attendance:", error.message);
    res.status(500).json({ success: false, message: "Error while deleting attendance.", error: error.message });
  };
};

