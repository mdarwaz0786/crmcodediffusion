import LatePunchIn from "../models/latePunchIn.model.js";
import Attendance from "../models/attendance.model.js";
import Team from "../models/team.model.js";
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

// Helper function to compare two times
function compareTime(time1, time2) {
  if (!time1 || !time2) {
    return;
  };

  const [hours1, minutes1] = time1.split(":").map(Number);
  const [hours2, minutes2] = time2.split(":").map(Number);

  if (hours1 > hours2 || (hours1 === hours2 && minutes1 > minutes2)) {
    return 1;
  };

  if (hours1 === hours2 && minutes1 === minutes2) {
    return 0;
  };

  return -1;
};

// Create a new late punch-in entry
export const createLatePunchIn = async (req, res) => {
  try {
    const { employee, attendanceDate, approvedBy, punchInTime } = req.body;

    // Validate required fields
    if (!employee) {
      return res.status(400).json({ success: false, message: "Employee is required." });
    };

    if (!attendanceDate) {
      return res.status(400).json({ success: false, message: "Attendance date is required." });
    };

    if (!punchInTime) {
      return res.status(400).json({ success: false, message: "Punch in time is required." });
    };

    // Get current date and requested date
    const currentDate = new Date().toISOString().split('T')[0];
    const requestedDate = attendanceDate;

    // Calculate the date for two days ago
    const twoDaysBefore = new Date();
    twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);
    const formattedTwoDaysBefore = twoDaysBefore.toISOString().split('T')[0];

    // Check if the requested date is within the last two days and same day
    if (requestedDate < formattedTwoDaysBefore) {
      return res.status(400).json({ success: false, message: "Late punch in request can only be applied for last two days attendance." });
    };

    if (requestedDate > currentDate) {
      return res.status(400).json({ success: false, message: "Late punch in request can not be applied for future date attendance." });
    };

    // Check if a late punch-in request already exists
    const existingLatePunchIn = await LatePunchIn.findOne({ employee, attendanceDate });

    if (existingLatePunchIn) {
      if (["Approved", "Pending"].includes(existingLatePunchIn?.status)) {
        return res.status(400).json({ success: false, message: `Late punch in request for date ${attendanceDate} is already applied and status is ${existingLatePunchIn?.status}.` });
      };
    };

    // Check if attendance exists and punch-in is valid
    const attendance = await Attendance.findOne({ employee, attendanceDate });

    if (!attendance) {
      return res.status(400).json({ success: false, message: `Attendance not exists for date ${attendanceDate}` });
    };

    if (!attendance?.punchIn) {
      return res.status(400).json({ success: false, message: `Punch in missing for date ${attendanceDate}` });
    };

    // Create new late punch-in request
    const newLatePunchIn = new LatePunchIn({ employee, attendanceDate, punchInTime, approvedBy });
    await newLatePunchIn.save();

    // Send email
    const sendBy = await Team.findById(employee);
    const subject = `${sendBy?.name} applied for late punch-in for attendance date ${attendanceDate} and punch-in time ${punchInTime}`;
    const htmlContent = `<p>Late punch-in request has been applied by ${sendBy?.name} for attendance date ${attendanceDate} to update punch-in time ${punchInTime}.</p><p>Please review the request.</p>`;
    sendEmail(process.env.RECEIVER_EMAIL_ID, subject, htmlContent);

    // Send push notification to admin
    const teams = await Team
      .find()
      .populate({ path: 'role', select: "name" })
      .exec();

    const filteredAdmins = teams?.filter((team) => team?.role?.name?.toLowerCase() === "admin");

    if (filteredAdmins?.length > 0) {
      const payload = {
        notification: {
          title: `${sendBy?.name} Applied for Late Punch-In`,
          body: `${sendBy?.name} has applied for late punch-in for attendance date ${attendanceDate} to update punch in time ${punchInTime}.`,
        },
      };

      await Promise.allSettled(filteredAdmins?.map((admin) => firebase.messaging().send({ ...payload, token: admin?.fcmToken })));
    };

    return res.status(201).json({ success: true, data: newLatePunchIn });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get all late punch in entries
export const getAllLatePunchIns = async (req, res) => {
  try {
    let query = {};
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

    // Filter by employee ID
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

    const latePunchIns = await LatePunchIn.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("employee")
      .populate("approvedBy")
      .exec();

    if (!latePunchIns) {
      return res.status(404).json({ success: false, message: 'Late puch in not found' });
    };

    const total = await LatePunchIn.countDocuments(query);

    return res.status(200).json({ success: true, data: latePunchIns, totalCount: total });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get a late punch in entry by ID
export const getLatePunchInById = async (req, res) => {
  try {
    const { id } = req.params;
    const latePunchIn = await LatePunchIn.findById(id)
      .populate("employee")
      .populate("approvedBy")
      .exec();

    if (!latePunchIn) {
      return res.status(404).json({ success: false, message: "Late punch in not found." });
    };

    return res.status(200).json({ success: true, data: latePunchIn });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Controller to fetch Pending status data
export const getPendingPunchInRequests = async (req, res) => {
  try {
    const pendingRequests = await LatePunchIn
      .find({ status: 'Pending' })
      .sort({ createdAt: -1 })
      .populate('employee', 'name')
      .exec();

    res.status(200).json({ success: true, data: pendingRequests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Update late punch in request and handle attendance based on status
export const updateLatePunchIn = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { status, approvedBy } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    };

    if (!approvedBy) {
      return res.status(400).json({ success: false, message: "ApprovedBy is required" });
    };

    const latePunchIn = await LatePunchIn
      .findById(id)
      .populate("employee")
      .session(session);

    if (!latePunchIn) {
      return res.status(404).json({ success: false, message: "Late punch in request not found." });
    };

    if (latePunchIn?.status === "Approved" || latePunchIn?.status === "Rejected") {
      return res.status(400).json({ success: false, message: "This late punch in request has already been processed." });
    };

    if (latePunchIn?.status === "Pending" && status === "Pending") {
      return res.status(400).json({ success: false, message: "This late punch in request is already in pending." });
    };

    const approveBy = await Team
      .findById(approvedBy)
      .session(session);

    if (!approveBy) {
      return res.status(404).json({ success: false, message: "Approver not found." });
    };

    if (status === "Rejected") {
      latePunchIn.status = "Rejected";
      latePunchIn.approvedBy = approvedBy;
      await latePunchIn.save({ session });

      sendEmail(latePunchIn?.employee?.email, "Your Late Punch In Request Rejected", `<p>Your late punch in request for date ${latePunchIn.attendanceDate} has been rejected.</p><p>Regards,<br/>${approveBy.name}</p>`);

      if (latePunchIn?.employee?.fcmToken) {
        const payload = {
          notification: {
            title: "Late Punch-In Request Rejected",
            body: `Late punch-in request for date ${latePunchIn?.attendanceDate} has been rejected.`,
          },
        };
        await firebase.messaging().send({ ...payload, token: latePunchIn?.employee?.fcmToken });
      };

      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({ success: true, message: "Late punch in request rejected." });
    };

    const attendance = await Attendance.findOne({
      employee: latePunchIn?.employee,
      attendanceDate: latePunchIn?.attendanceDate,
      punchIn: true,
    }).session(session);

    if (!attendance) {
      return res.status(404).json({ success: false, message: `Punch in missing` });
    };

    if (status === "Approved") {
      const EXPECTED_PUNCH_IN = "10:00";
      const HALF_DAY_THRESHOLD = "11:00";
      const lateIn = calculateTimeDifference(EXPECTED_PUNCH_IN, latePunchIn?.punchInTime);
      const attendanceStatus = compareTime(latePunchIn?.punchInTime, HALF_DAY_THRESHOLD) === 1 ? "Half Day" : "Present";
      attendance.punchInTime = latePunchIn?.punchInTime;
      attendance.status = attendanceStatus;
      attendance.lateIn = lateIn;
      attendance.hoursWorked = calculateTimeDifference(latePunchIn?.punchInTime, attendance?.punchOutTime);
      await attendance.save({ session });

      latePunchIn.status = "Approved";
      latePunchIn.approvedBy = approvedBy;
      await latePunchIn.save({ session });

      sendEmail(latePunchIn?.employee?.email, "Your Late Punch In Request Approved", `<p>Your late punch in request date ${latePunchIn?.attendanceDate} has been approved and punch in time ${latePunchIn?.punchInTime} is marked.</p><p>Regards,<br/>${approveBy?.name}</p>`);

      if (latePunchIn?.employee?.fcmToken) {
        const payload = {
          notification: {
            title: "Late Punch-In Request Approved",
            body: `Late punch-in request for date ${latePunchIn?.attendanceDate} has been approved.`,
          },
        };
        await firebase.messaging().send({ ...payload, token: latePunchIn?.employee?.fcmToken });
      };

      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({ success: true, message: `Late punch in request approved and punch in time ${latePunchIn.punchInTime} is marked` });
    };

    return res.status(400).json({ success: false, message: "Invalid status provided." });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Delete a late punch in entry
export const deleteLatePunchIn = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLatePunchIn = await LatePunchIn.findByIdAndDelete(id);

    if (!deletedLatePunchIn) {
      return res.status(404).json({ success: false, message: "Late punch in request not found." });
    };

    return res.status(200).json({ success: true, message: "Late punch in request deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};
