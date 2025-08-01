import LeaveApproval from "../models/leaveApproval.model.js";
import Team from "../models/team.model.js";
import Holiday from "../models/holiday.model.js";
import mongoose from "mongoose";
import { sendEmail } from '../services/emailService.js';
import firebase from "../firebase/index.js";

// Helper function to get a range of dates between two dates in "yyyy-mm-dd" format
const getDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  };

  return dates;
};

// Create a new leave approval request
export const createLeaveApproval = async (req, res) => {
  try {
    const { employee, startDate, endDate, leaveApprovedBy, leaveStatus, reason } = req.body;

    // List of required fields
    const requiredFields = ['employee', 'startDate', 'endDate', 'reason'];

    // Check if any required field is missing or empty
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ success: false, message: `${field} is required` });
      };
    };

    const existingEmployee = await Team.findById(employee);

    if (!existingEmployee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    };

    let balance;
    const leaveSystemStart = new Date("2025-07-01");
    const joinDate = new Date(existingEmployee?.joining);

    const accrualStart = joinDate > leaveSystemStart
      ? new Date(joinDate.getFullYear(), joinDate.getMonth(), 1)
      : leaveSystemStart;

    const today = new Date();

    if (today < accrualStart) {
      balance = 0;
    };

    // Load holidays into a Set
    const holidays = await Holiday.find({});
    const holidaySet = new Set(holidays.map((h) => new Date(h.date).toDateString()));

    // Fetch approved leaves
    const approvedLeaves = await LeaveApproval.find({
      employee: employee,
      leaveStatus: "Approved",
      startDate: { $gte: accrualStart.toISOString().split("T")[0] },
    });

    // Count valid leave days excluding holidays and Sundays
    let totalTaken = 0;

    approvedLeaves.forEach((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      let current = new Date(start);

      while (current <= end) {
        const isSunday = current.getDay() === 0;
        const isHoliday = holidaySet.has(current.toDateString());

        if (!isSunday && !isHoliday) {
          totalTaken += 1;
        };

        current.setDate(current.getDate() + 1);
      };
    });

    // Calculate total entitled leave = months * 2
    let cumulativeAdded = 0;
    let cursor = new Date(accrualStart);

    while (cursor <= today) {
      cumulativeAdded += 2;
      cursor.setMonth(cursor.getMonth() + 1);
    };

    balance = cumulativeAdded - totalTaken;

    if (balance <= 0) {
      return res.status(400).json({ success: false, message: "Insufficient leave balance" });
    };

    // Convert startDate and endDate to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Ensure start date is not the current date or in the past 
    const currentDate = new Date();

    if (start.setHours(0, 0, 0, 0) < currentDate.setHours(0, 0, 0, 0)) {
      return res.status(400).json({ success: false, message: "Start date can not be in the past, select future date." });
    };

    if (start.setHours(0, 0, 0, 0) > end.setHours(0, 0, 0, 0)) {
      return res.status(400).json({ success: false, message: "Start date can not be later than end date." });
    };

    const existingLeaveApproval = await LeaveApproval.findOne({ employee, startDate, endDate });

    if (existingLeaveApproval) {
      if (existingLeaveApproval?.status === "Approved" || existingLeaveApproval?.status === "Pending") {
        return res.status(400).json({ success: false, message: `Leave request for start date ${startDate} and end date ${endDate} is already applied and status is ${existingLeaveApproval?.status}.` });
      };
    };

    const leaveDuration = getDateRange(startDate, endDate);

    const newLeaveApproval = new LeaveApproval({
      employee,
      startDate,
      endDate,
      leaveApprovedBy,
      leaveStatus,
      leaveDuration: leaveDuration.length,
      reason,
    });

    await newLeaveApproval.save();

    const subject = `${existingEmployee?.name} Applied Leave for ${leaveDuration.length} Days`;

    const htmlContent = `
      <p><strong>Employee Name:</strong> ${existingEmployee?.name}</p>
      <p><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString('en-GB')}</p>
      <p><strong>End Date:</strong> ${new Date(endDate).toLocaleDateString('en-GB')}</p>
      <p><strong>Leave Duration:</strong> ${leaveDuration.length} Days</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Please review the request.</p>
    `;

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
          title: `${existingEmployee?.name} Applied for Leave`,
          body: `${existingEmployee?.name} has applied for leave from ${startDate} to ${endDate}.`,
        },
      };

      await Promise.allSettled(filteredAdmins?.map((admin) => firebase.messaging().send({ ...payload, token: admin?.fcmToken })));
    };

    return res.status(201).json({ success: true, data: newLeaveApproval });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get all leave approvals
export const fetchAllLeaveApproval = async (req, res) => {
  try {
    const { employeeId } = req.query;
    let query = {};
    let sort = {};

    // Filter by year only (all months)
    if (req.query.year && !req.query.month) {
      const year = req.query.year;
      query.startDate = {
        $gte: `${year}-01-01`,
        $lte: `${year}-12-31`,
      };
    };

    // Filter by month only (all years)
    if (req.query.month && !req.query.year) {
      const month = req.query.month;
      query.startDate = { $regex: `-${month}-`, $options: "i" };
    };

    // Filter by both year and month
    if (req.query.year && req.query.month) {
      const year = req.query.year;
      const month = req.query.month;

      query.startDate = {
        $gte: `${year}-${month}-01`,
        $lte: `${year}-${month}-31`,
      };
    };

    // Filter by employeeId
    if (employeeId) {
      query.employee = employeeId;
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

    // Fetch leave approvals with the constructed query
    const leaveApprovals = await LeaveApproval.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("employee")
      .populate("leaveApprovedBy")
      .exec();

    if (!leaveApprovals) {
      return res.status(404).json({ success: false, message: 'Leave approvals not found' });
    };

    // Calculate total count
    const totalCount = await LeaveApproval.countDocuments(query);

    return res.status(200).json({ success: true, data: leaveApprovals, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get a single leave approval request by ID
export const fetchSingleLeaveApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const leaveApproval = await LeaveApproval
      .findById(id)
      .populate("employee")
      .populate("leaveApprovedBy")
      .exec();

    if (!leaveApproval) {
      return res.status(404).json({ success: false, message: "Leave approval request not found" });
    };

    return res.status(200).json({ success: true, data: leaveApproval });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Controller to fetch particular employee leave approval
export const getLeaveApprovalByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const leaveSystemStart = new Date("2025-07-01");

    const leave = await LeaveApproval
      .find({
        employee: employeeId,
        startDate: { $gte: leaveSystemStart.toISOString().split("T")[0] },
      })
      .sort({ createdAt: -1 })
      .populate('employee', 'name')
      .exec();

    return res.status(200).json({ success: true, data: leave });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Controller to fetch Pending status data
export const getPendingLeaveApprovalRequests = async (req, res) => {
  try {
    const pendingRequests = await LeaveApproval
      .find({ leaveStatus: 'Pending' })
      .sort({ createdAt: -1 })
      .populate('employee', 'name')
      .exec();

    return res.status(200).json({ success: true, data: pendingRequests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Update leave approval with transaction
export const updateLeaveApproval = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { leaveId, approverId, leaveStatus } = req.body;

    if (!leaveId) {
      return res.status(400).json({ success: false, message: "Leave Id is required." });
    };

    if (!approverId) {
      return res.status(400).json({ success: false, message: "Approver Id is required." });
    };

    if (!leaveStatus) {
      return res.status(400).json({ success: false, message: "Leave status is required." });
    };

    const leaveRequest = await LeaveApproval
      .findById(leaveId)
      .populate("employee")
      .session(session);

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: "Leave request not found." });
    };

    if (["Approved", "Rejected"].includes(leaveRequest?.leaveStatus)) {
      return res.status(400).json({ success: false, message: "This leave request has already been processed." });
    };

    if (leaveRequest?.leaveStatus === "Pending" && leaveStatus === "Pending") {
      return res.status(400).json({ success: false, message: "This leave request is already in pending." });
    };

    const employee = await Team.findById(leaveRequest?.employee?._id).session(session);
    const approveBy = await Team.findById(approverId).session(session);

    if (leaveStatus === "Rejected") {
      leaveRequest.leaveStatus = "Rejected";
      leaveRequest.leaveApprovedBy = approverId;
      await leaveRequest.save({ session });

      sendEmail(employee?.email, "Your Leave Request Rejected", `<p>Your leave request from ${leaveRequest?.startDate} to ${leaveRequest?.endDate} has been rejected.</p><p>Regards,<br/>${approveBy?.name}</p>`);

      if (employee?.fcmToken) {
        const payload = {
          notification: {
            title: "Your Leave Request Rejected",
            body: `Your leave request from ${leaveRequest?.startDate} to ${leaveRequest?.endDate} has been rejected.`,
          },
        };
        await firebase.messaging().send({ ...payload, token: employee?.fcmToken });
      };

      await session.commitTransaction();
      return res.status(200).json({ success: true, message: "Leave request rejected." });
    };

    if (leaveStatus === "Approved") {
      leaveRequest.leaveStatus = "Approved";
      leaveRequest.leaveApprovedBy = approverId;
      await leaveRequest.save({ session });

      let leaveDates = getDateRange(leaveRequest?.startDate, leaveRequest?.endDate);

      const holidays = await Holiday.find({ date: { $in: leaveDates } });

      leaveDates = leaveDates.filter((date) => {
        const isHoliday = holidays?.some((holiday) => holiday?.date === date);
        const isSunday = new Date(date).getDay() === 0;
        return !isHoliday && !isSunday;
      });

      const approvedLeaveEntries = leaveDates.map((date) => ({
        date: date,
        approvedBy: approverId,
        reason: leaveRequest?.reason,
      }));

      if (approvedLeaveEntries.length > 0) {
        await Team.findOneAndUpdate(
          { _id: employee?._id },
          {
            $push: {
              approvedLeaves: { $each: approvedLeaveEntries },
            },
            $set: {
              currentLeaveBalance: (parseFloat(employee?.currentLeaveBalance) - approvedLeaveEntries.length).toString(),
              usedLeaveBalance: (parseFloat(employee?.usedLeaveBalance) + approvedLeaveEntries.length).toString(),
            },
          },
          { session },
        );
      };

      sendEmail(employee?.email, "Your Leave Request Approved", `<p>Your leave request from ${leaveRequest?.startDate} to ${leaveRequest?.endDate} has been approved.</p><p>Regards,<br/>${approveBy?.name}</p>`);

      if (employee?.fcmToken) {
        const payload = {
          notification: {
            title: "Leave Request Approved",
            body: `Your Leave request from ${leaveRequest?.startDate} to ${leaveRequest?.endDate} has been approved.`,
          },
        };
        await firebase.messaging().send({ ...payload, token: employee?.fcmToken });
      };

      await session.commitTransaction();
      return res.status(200).json({ success: true, message: "Leave request approved." });
    };

    return res.status(400).json({ success: false, message: "Invalid leave status provided." });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  };
};

// Delete a leave approval request by Id
export const deleteLeaveApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLeaveApproval = await LeaveApproval.findByIdAndDelete(id);

    if (!deletedLeaveApproval) {
      return res.status(404).json({ success: false, message: "Leave approval request not found" });
    };

    return res.status(200).json({ success: true, message: "Leave approval request deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};
