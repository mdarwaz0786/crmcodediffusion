import MissedPunchOut from "../models/missedPunchOut.model.js";
import Attendance from "../models/attendance.model.js";
import Team from "../models/team.model.js";
import { sendEmail } from "../services/emailService.js";

// Calculate time difference in HH:MM format
const calculateTimeDifference = (startTime, endTime) => {
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

    // Validate required fields
    if (!employee) {
      return res.status(400).json({ success: false, message: "Employee is required" });
    };

    if (!attendanceDate) {
      return res.status(400).json({ success: false, message: "Attendance date is required" });
    };

    if (!punchOutTime) {
      return res.status(400).json({ success: false, message: "Punch out time is required" });
    };

    // Get current date and requested date
    const currentDate = new Date().toISOString().split('T')[0];
    const requestedDate = attendanceDate;

    // Calculate the date for two days ago
    const twoDaysBefore = new Date();
    twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);
    const formattedTwoDaysBefore = twoDaysBefore.toISOString().split('T')[0];

    // Check if the requested date is within the last two days
    if (requestedDate < formattedTwoDaysBefore || requestedDate > currentDate) {
      return res.status(400).json({ success: false, message: "Missed punch out can only be applied for the last two days." });
    };

    // Check if a missed punch-out request already exists
    const existingMissedPunchOut = await MissedPunchOut.findOne({ employee, attendanceDate });

    if (existingMissedPunchOut) {
      return res.status(400).json({ success: false, message: `Missed punch out already applied for date ${attendanceDate}` });
    };

    // Check if attendance exists and if punch-in and punch-out are valid
    const attendance = await Attendance.findOne({ employee, attendanceDate });

    if (!attendance) {
      return res.status(400).json({ success: false, message: `Attendance not exists for date ${attendanceDate}` });
    };

    if (!attendance?.punchIn) {
      return res.status(400).json({ success: false, message: `Punch in missing for date ${attendanceDate}` });
    };

    if (attendance && attendance?.punchOut) {
      return res.status(400).json({ success: false, message: `Punch out already marked for date ${attendanceDate}` });
    };

    // Create new missed punch-out request
    const newMissedPunchOut = new MissedPunchOut({ employee, attendanceDate, punchOutTime, approvedBy });

    await newMissedPunchOut.save();

    // Send email notification
    const emp = await Team.findById(employee);
    const subject = `${emp.name} applied for missed punch out on ${attendanceDate}`;
    const htmlContent = `<p>Missed punch out request has been applied by ${emp.name} for date ${attendanceDate}.</p><p>Please review the request.</p>`;

    sendEmail(process.env.RECEIVER_EMAIL_ID, subject, htmlContent);

    res.status(201).json({ success: true, data: newMissedPunchOut });
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
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
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

    const missedPunchOut = await MissedPunchOut
      .findById(id)
      .populate("employee")
      .exec();

    if (!missedPunchOut) {
      return res.status(404).json({ success: false, message: "Missed punch out request not found." });
    };

    if (missedPunchOut?.status === "Approved" || missedPunchOut?.status === "Rejected") {
      return res.status(400).json({ success: false, message: "This missed punch out request has already been processed." });
    };

    if (missedPunchOut?.status === "Pending" && status === "Pending") {
      return res.status(400).json({ success: false, message: "This missed punch out request is already in pending." });
    };

    const approveBy = await Team.findById(approvedBy);

    if (status === "Rejected") {
      missedPunchOut.status = "Rejected";
      missedPunchOut.approvedBy = approvedBy;
      await latePunchIn.save();
      sendEmail(
        missedPunchOut.employee.email,
        "Your Late Punch In Request Rejected",
        `<p>Your late punch in request date ${missedPunchOut?.attendanceDate} has been rejected.</p>
        <p>Regards,<br/>${approveBy?.name}</p>`
      );
      return res.status(200).json({ success: true, message: "Punch out request rejected." });
    };

    const attendance = await Attendance.findOne({
      employee: missedPunchOut?.employee,
      attendanceDate: missedPunchOut?.attendanceDate,
      punchIn: true,
    });

    if (!attendance) {
      return res.status(404).json({ success: false, message: `Punch in missing` });
    };

    if (attendance?.punchOut) {
      return res.status(400).json({ success: false, message: "Punch out already marked." });
    };

    if (status === "Approved") {
      attendance.punchOutTime = missedPunchOut?.punchOutTime;
      attendance.punchOut = true;
      attendance.hoursWorked = calculateTimeDifference(attendance?.punchInTime, missedPunchOut?.punchOutTime);
      await attendance.save();

      missedPunchOut.status = "Approved";
      missedPunchOut.approvedBy = approvedBy;
      await missedPunchOut.save();

      sendEmail(
        missedPunchOut?.employee?.email,
        "Your Missed Punch Out Request Approved",
        `<p>Your missed punch out request date ${missedPunchOut?.attendanceDate} has been approved and punch out time ${missedPunchOut?.punchOutTime} is marked.</p>
        <p>Regards,<br/>${approveBy?.name}</p>`
      );
      return res.status(200).json({ success: true, message: `Missed punch out request approved and punch out time ${missedPunchOut?.punchOutTime} is marked` });
    };

    res.status(400).json({ success: false, message: "Invalid status provided." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
