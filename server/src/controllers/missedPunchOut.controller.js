import MissedPunchOut from "../models/missedPunchOut.model.js";
import Attendance from "../models/attendance.model.js";

// Create a new missed punch-out entry
export const createMissedPunchOut = async (req, res) => {
  try {
    const { employee, attendanceDate, punchOutTime } = req.body;

    if (!employee || !attendanceDate || !punchOutTime) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    };

    const attendance = await Attendance.findOne({ employee, attendanceDate });

    if (attendance && attendance.punchOut) {
      return res.status(400).json({ success: false, message: "Punch out already marked for this date." });
    };

    const existingMissedPunchOut = await MissedPunchOut.findOne({ employee, attendanceDate });

    if (existingMissedPunchOut) {
      return res.status(400).json({ success: false, message: "Missed punch out already applied for this date." });
    };

    const newMissedPunchOut = new MissedPunchOut({
      employee,
      attendanceDate,
      punchOutTime,
    });

    await newMissedPunchOut.save();

    res.status(201).json({ success: true, message: "Missed punch out created successfully", data: newMissedPunchOut });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Get all missed punch out entries
export const getAllMissedPunchOuts = async (req, res) => {
  try {
    const missedPunchOuts = await MissedPunchOut.find().populate("employee", "name email");
    res.status(200).json({ success: true, data: missedPunchOuts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Get a missed punch out entry by ID
export const getMissedPunchOutById = async (req, res) => {
  try {
    const { id } = req.params;
    const missedPunchOut = await MissedPunchOut.findById(id).populate("employee", "name email");

    if (!missedPunchOut) {
      return res.status(404).json({ success: false, message: "Missed punch out not found." });
    };

    res.status(200).json({ success: true, data: missedPunchOut });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Update missed punch out request and handle attendance based on status
export const updateMissedPunchOut = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const missedPunchOut = await MissedPunchOut.findById(id);

    if (!missedPunchOut) {
      return res.status(404).json({ success: false, message: "Request not found." });
    };

    const attendance = await Attendance.findOne({
      employee: missedPunchOut.employee,
      attendanceDate: missedPunchOut.attendanceDate,
    });

    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance record not found." });
    };

    if (missedPunchOut.status === "Approved" && (status === "Pending" || status === "Rejected")) {
      attendance.punchOutTime = null;
      attendance.punchOut = false;
      await attendance.save();
    };

    if (status === "Pending") {
      missedPunchOut.status = "Pending";
      await missedPunchOut.save();
      return res.status(200).json({ success: true, message: "Request marked as pending." });
    };

    if (status === "Rejected") {
      missedPunchOut.status = "Rejected";
      await missedPunchOut.save();
      return res.status(200).json({ success: true, message: "Request marked as rejected." });
    };

    if (status === "Approved") {
      if (attendance.punchOut) {
        return res.status(400).json({ success: false, message: "Punch out already marked." });
      };

      attendance.punchOutTime = missedPunchOut.punchOutTime;
      attendance.punchOut = true;
      await attendance.save();

      missedPunchOut.status = "Approved";
      await missedPunchOut.save();
      return res.status(200).json({ success: true, message: "Punch out approved and attendance updated." });
    };

    res.status(400).json({ success: false, message: "Invalid status provided." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error while updating request.", error: error.message });
  };
};

// Delete a missed punch out entry
export const deleteMissedPunchOut = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMissedPunchOut = await MissedPunchOut.findByIdAndDelete(id);

    if (!deletedMissedPunchOut) {
      return res.status(404).json({ success: false, message: "Missed punch out not found." });
    };

    res.status(200).json({ success: true, message: "Missed punch out deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};
