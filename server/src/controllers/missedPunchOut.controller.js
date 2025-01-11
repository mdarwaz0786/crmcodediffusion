import MissedPunchOut from "../models/missedPunchOut.model.js";
import Attendance from "../models/attendance.model.js";
import Team from "../models/team.model.js";
import { sendEmail } from "../services/emailService.js";

// Helper: Calculate time difference in HH:mm format
const calculateTimeDifference = (startTime, endTime) => {
  // Check if either startTime or endTime is empty
  if (!startTime || !endTime) {
    return "00:00";
  };

  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  const differenceMinutes = Math.max(endTotalMinutes - startTotalMinutes, 0);
  const hours = Math.floor(differenceMinutes / 60);
  const minutes = differenceMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// Create a new missed punch-out entry
export const createMissedPunchOut = async (req, res) => {
  try {
    const { employee, attendanceDate, approvedBy, punchOutTime } = req.body;

    if (!employee || !attendanceDate || !punchOutTime) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    };

    const attendance = await Attendance.findOne({ employee, attendanceDate });

    if (attendance && !attendance.punchIn) {
      return res.status(400).json({ success: false, message: "Punch in missing for this date." });
    };

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
      approvedBy,
    });

    await newMissedPunchOut.save();

    const emp = await Team.findById(employee);

    // Send email after missed punch out is created
    const subject = `${emp.name} apply missed punch out for date ${attendanceDate}`;

    const htmlContent =
      `<p>Missed punch out request has been submitted by ${emp.name} for date ${attendanceDate}.</p>
       <p>Pleave review the request.</p>`;

    sendEmail(process.env.RECEIVER_EMAIL_ID, subject, htmlContent);

    res.status(201).json({ success: true, message: "Missed punch out created successfully", data: newMissedPunchOut });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Get all missed punch out entries
export const getAllMissedPunchOuts = async (req, res) => {
  try {
    const query = {};
    let sort = {};

    // Filter by year only (all month)
    if (req.query.year && !req.query.month) {
      const year = req.query.year;
      query.attendanceDate = {
        $gte: `${year}-01-01`,
        $lte: `${year}-12-31`,
      };
    };

    // Filter by month only (all years)
    if (req.query.month && !req.query.year) {
      const month = req.query.month;
      query.attendanceDate = { $regex: `-${month}-`, $options: "i" };
    };

    // Filter by both year and month
    if (req.query.year && req.query.month) {
      const year = req.query.year;
      const month = req.query.month;

      query.attendanceDate = {
        $gte: `${year}-${month}-01`,
        $lte: `${year}-${month}-31`,
      };
    };

    // Filter by employee ID if provided
    if (req.query.employeeId) {
      query.employee = req.query.employeeId;;
    };

    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Handle sorting
    if (req.query.sort === 'Ascending') {
      sort = { createdAt: 1 };
    } else {
      sort = { createdAt: -1 };
    };

    const missedPunchOuts = await MissedPunchOut.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("employee")
      .populate("approvedBy")
      .exec();

    if (!missedPunchOuts) {
      return res.status(404).json({ success: false, message: 'Missed puch out not found' });
    };

    const total = await MissedPunchOut.countDocuments(query);

    res.status(200).json({ success: true, data: missedPunchOuts, totalCount: total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Get a missed punch out entry by ID
export const getMissedPunchOutById = async (req, res) => {
  try {
    const { id } = req.params;
    const missedPunchOut = await MissedPunchOut.findById(id).populate("employee").populate("approvedBy");

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
    const { status, approvedBy } = req.body;

    const missedPunchOut = await MissedPunchOut.findById(id).populate("employee").exec();

    if (!missedPunchOut) {
      return res.status(404).json({ success: false, message: "Missed punch out not found." });
    };

    const attendance = await Attendance.findOne({
      employee: missedPunchOut.employee,
      attendanceDate: missedPunchOut.attendanceDate,
      punchIn: true,
    });

    if (!attendance) {
      return res.status(404).json({ success: false, message: `Punch in missing` });
    };

    if (missedPunchOut.status === "Approved" && (status === "Pending" || status === "Rejected")) {
      attendance.punchOutTime = null;
      attendance.punchOut = false;
      attendance.hoursWorked = "00:00";
      await attendance.save();
    };

    if (status === "Pending") {
      missedPunchOut.status = "Pending";
      missedPunchOut.approvedBy = approvedBy;
      await missedPunchOut.save();
      sendEmail(
        missedPunchOut.employee.email,
        "Your Punch Out Request Marked as Pending",
        `<p>Your punch out request dated ${missedPunchOut.attendanceDate} has been marked as Pending.</p>
        <p>Regards,<br/>Hr Team</p>`
      );
      return res.status(200).json({ success: true, message: "Punch out request marked as pending." });
    };

    if (status === "Rejected") {
      missedPunchOut.status = "Rejected";
      missedPunchOut.approvedBy = approvedBy;
      await missedPunchOut.save();
      sendEmail(
        missedPunchOut.employee.email,
        "Your Punch Out Request Rejected",
        `<p>Your punch out request dated ${missedPunchOut.attendanceDate} has been rejected.</p>
        <p>Regards,<br/>Hr Team</p>`
      );
      return res.status(200).json({ success: true, message: "Punch out request rejected." });
    };

    if (status === "Approved") {
      if (attendance.punchOut) {
        return res.status(400).json({ success: false, message: "Punch out already marked." });
      };

      attendance.punchOutTime = missedPunchOut.punchOutTime;
      attendance.punchOut = true;
      attendance.hoursWorked = calculateTimeDifference(attendance.punchInTime, missedPunchOut.punchOutTime);
      await attendance.save();

      missedPunchOut.status = "Approved";
      missedPunchOut.approvedBy = approvedBy;
      await missedPunchOut.save();

      sendEmail(
        missedPunchOut.employee.email,
        "Your Punch Out Request Approved",
        `<p>Your punch out request dated ${missedPunchOut.attendanceDate} has been approved and punch out time ${missedPunchOut.punchOutTime} is marked.</p>
        <p>Regards,<br/>Hr Team</p>`
      );
      return res.status(200).json({ success: true, message: "Punch out approved and attendance updated." });
    };

    res.status(400).json({ success: false, message: "Invalid status provided." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error while updating missed punch out.", error: error.message });
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
