import MissedPunchOut from "../models/missedPunchOut.model.js";
import Attendance from "../models/attendance.model.js";
import Team from "../models/team.model.js";
import Company from "../models/company.model.js";
import { sendEmail } from "../services/emailService.js";
import mongoose from "mongoose";
import firebase from "../firebase/index.js";

// Calculate time difference in HH:MM format
const calculateTimeDifference = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return "";
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
    const company = req.company;

    if (!employee) {
      return res.status(400).json({ success: false, message: "Employee is required." });
    };

    if (!attendanceDate) {
      return res.status(400).json({ success: false, message: "Attendance date is required." });
    };

    if (!punchOutTime) {
      return res.status(400).json({ success: false, message: "Punch out time is required." });
    };

    // Get current date and requested date
    const currentDate = new Date().toISOString().split('T')[0];
    const requestedDate = attendanceDate;

    // Calculate the date for two days ago
    const twoDaysBefore = new Date();
    twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);
    const formattedTwoDaysBefore = twoDaysBefore.toISOString().split('T')[0];

    // Check if the requested date is within the last two days
    if (requestedDate < formattedTwoDaysBefore) {
      return res.status(400).json({ success: false, message: "Missed punch out request can only be applied for the last two days attendance." });
    };

    if (requestedDate > currentDate) {
      return res.status(400).json({ success: false, message: "Missed punch out request request can not be applied for future date attendance." });
    };

    // Prevent applying for the current date before 18:30 PM
    if (requestedDate === currentDate) {
      const time = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
      const [hours, minutes] = time.split(':').map(Number);

      const cutoffHours = 18;
      const cutoffMinutes = 30;

      if (hours < cutoffHours || (hours === cutoffHours && minutes < cutoffMinutes)) {
        return res.status(400).json({ success: false, message: "Missed punch out request for today can only be applied after 18:30 PM." });
      };
    };

    // Check if a missed punch-out request already exists
    const existingMissedPunchOut = await MissedPunchOut.findOne({ employee, attendanceDate, company });

    if (existingMissedPunchOut) {
      if (existingMissedPunchOut?.status === "Approved" || existingMissedPunchOut?.status === "Pending") {
        return res.status(400).json({ success: false, message: `Missed punch out request for date ${attendanceDate} is already applied and status is ${existingMissedPunchOut?.status}.` });
      };
    };

    // Check if attendance exists and if punch-in and punch-out are valid
    const attendance = await Attendance.findOne({ employee, attendanceDate, company });

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
    const newMissedPunchOut = new MissedPunchOut({ employee, attendanceDate, punchOutTime, approvedBy, company });

    await newMissedPunchOut.save();

    // Send email
    const appliedBy = await Team.findOne({ _id: employee, company }).populate("office");

    if (appliedBy?.office?.noReplyEmail && appliedBy?.office?.noReplyEmailAppPassword) {
      const from = appliedBy?.office?.noReplyEmail;
      const to = from;
      const password = appliedBy?.office?.noReplyEmailAppPassword;
      const subject = `${appliedBy?.name} applied for missed punch out for attendance date ${attendanceDate}`;
      const htmlContent = `<p>Missed punch out request has been applied by ${appliedBy?.name} for attendance date ${attendanceDate}.</p><p>Please review the request.</p>`;
      sendEmail(from, to, password, subject, htmlContent);
    };

    // Send push notification to admin
    const teams = await Company
      .find({ _id: appliedBy?.company })
      .populate({ path: 'role', select: "name" })
      .exec();

    const filteredAdmins = teams?.filter((team) => team?.role?.name?.toLowerCase() === "company" && team?.fcmToken);

    if (filteredAdmins?.length > 0) {
      const payload = {
        notification: {
          title: `${appliedBy?.name} Applied for Missed Punch-out`,
          body: `${appliedBy?.name} has applied for missed punch-out for attendance date ${attendanceDate} to mark punch out time ${punchOutTime}.`,
        },
      };

      await Promise.allSettled(filteredAdmins?.map((admin) => firebase.messaging().send({ ...payload, token: admin?.fcmToken })));
    };

    return res.status(201).json({ success: true, data: newMissedPunchOut });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get all missed punch out entries
export const getAllMissedPunchOuts = async (req, res) => {
  try {
    let query = { company: req.company };
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
      .exec();

    if (!missedPunchOuts) {
      return res.status(404).json({ success: false, message: 'Missed puch out not found' });
    };

    const total = await MissedPunchOut.countDocuments(query);

    return res.status(200).json({ success: true, data: missedPunchOuts, totalCount: total });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get a missed punch out entry by ID
export const getMissedPunchOutById = async (req, res) => {
  try {
    const { id } = req.params;
    const missedPunchOut = await MissedPunchOut
      .findOne({ _id: id, company: req.company })
      .populate("employee")
      .exec();

    if (!missedPunchOut) {
      return res.status(404).json({ success: false, message: "Missed punch out request not found." });
    };

    return res.status(200).json({ success: true, data: missedPunchOut });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Controller to fetch Pending status data
export const getPendingPunchOutRequests = async (req, res) => {
  try {
    const pendingRequests = await MissedPunchOut
      .find({ status: 'Pending', company: req.company })
      .sort({ createdAt: -1 })
      .populate('employee', 'name')
      .exec();

    return res.status(200).json({ success: true, data: pendingRequests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Update missed punch out request and handle attendance based on status
export const updateMissedPunchOut = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required." });
    };

    const missedPunchOut = await MissedPunchOut
      .findOne({ _id: id, company: req.company })
      .populate("employee")
      .populate("employee.office")
      .session(session);

    if (!missedPunchOut) {
      return res.status(404).json({ success: false, message: "Missed punch out request not found." });
    };

    if (missedPunchOut?.status === "Approved" || missedPunchOut?.status === "Rejected") {
      return res.status(400).json({ success: false, message: "This missed punch out request has already been processed." });
    };

    if (missedPunchOut?.status === "Pending" && status === "Pending") {
      return res.status(400).json({ success: false, message: "This missed punch out request is already in pending." });
    };

    if (status === "Rejected") {
      missedPunchOut.status = "Rejected";
      await missedPunchOut.save({ session });

      const from = missedPunchOut?.employee?.office?.noReplyEmail;
      const to = missedPunchOut?.employee?.email;
      const password = missedPunchOut?.employee?.office?.noReplyEmailAppPassword;

      if (from && to && password) {
        sendEmail(from, to, password, "Your Missed Punch Out Request Rejected", `<p>Your missed punch out request for attendance date ${missedPunchOut?.attendanceDate} has been rejected.</p><p>Regards,<br/>${missedPunchOut?.employee?.office?.name}</p>`);
      };

      if (missedPunchOut?.employee?.fcmToken) {
        const payload = {
          notification: {
            title: "Missed Punch-Out Request Rejected",
            body: `Your missed punch-out request for attendance date ${missedPunchOut?.attendanceDate} has been rejected.`,
          },
        };
        await firebase.messaging().send({ ...payload, token: missedPunchOut?.employee?.fcmToken });
      };

      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({ success: true, message: "Punch out request rejected." });
    };

    const attendance = await Attendance.findOne({
      employee: missedPunchOut?.employee,
      attendanceDate: missedPunchOut?.attendanceDate,
      punchIn: true,
      company: req.company,
    }).session(session);

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
      await attendance.save({ session });

      missedPunchOut.status = "Approved";
      await missedPunchOut.save({ session });

      const from = missedPunchOut?.employee?.office?.noReplyEmail;
      const to = missedPunchOut?.employee?.email;
      const password = missedPunchOut?.employee?.office?.noReplyEmailAppPassword;

      if (from && to && password) {
        sendEmail(form, to, password, "Your Missed Punch Out Request Approved", `<p>Your missed punch out request for attendance date ${missedPunchOut?.attendanceDate} has been approved and punch out time ${missedPunchOut?.punchOutTime} is marked.</p><p>Regards,<br/>${missedPunchOut?.employee?.office?.name}</p>`);
      };

      if (missedPunchOut?.employee?.fcmToken) {
        const payload = {
          notification: {
            title: "Missed Punch-Out Request Approved",
            body: `Your missed punch-out request for attendance date ${missedPunchOut?.attendanceDate} has been approved.`,
          },
        };
        await firebase.messaging().send({ ...payload, token: missedPunchOut?.employee?.fcmToken });
      };

      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({ success: true, message: `Missed punch out request approved and punch out time ${missedPunchOut?.punchOutTime} is marked.` });
    };

    return res.status(400).json({ success: false, message: "Invalid status provided." });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Delete a missed punch out request
export const deleteMissedPunchOut = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMissedPunchOut = await MissedPunchOut.findOneAndDelete({ _id: id, company: req.company });

    if (!deletedMissedPunchOut) {
      return res.status(404).json({ success: false, message: "Missed punch out request not found." });
    };

    return res.status(200).json({ success: true, message: "Missed punch out request deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};
