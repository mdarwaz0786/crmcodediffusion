import LeaveApproval from "../models/leaveApproval.model.js";
import Team from "../models/team.model.js";
import mongoose from "mongoose";
import { sendEmail } from '../services/emailService.js';

// Helper function to get a range of dates between two dates
const getDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  while (currentDate <= new Date(endDate)) {
    dates.push(new Date(currentDate));
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

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ success: false, message: "Start date cannot be later than end date" });
    };

    // Check if the employee exist
    const existingEmployee = await Team.findById(employee);

    if (!existingEmployee) {
      return res.status(400).json({ success: false, message: "Employee not found" });
    };

    if (parseFloat(existingEmployee?.currentLeaveBalance) < 0) {
      return res.status(400).json({ success: false, message: "Insufficient leave balance" });
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

    // Send email
    const htmlContent = `
      <p><strong>Employee Name:</strong> ${existingEmployee?.name}</p>
      <p><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString('en-GB')}</p>
      <p><strong>End Date:</strong> ${new Date(endDate).toLocaleDateString('en-GB')}</p>
      <p><strong>Leave Duration:</strong> ${leaveDuration.length} Days</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Please review the request.</p>
    `;

    sendEmail(process.env.RECEIVER_EMAIL_ID, subject, htmlContent);

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

    // Filter by year only (all month)
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

    // Filter by employee ID
    if (employeeId) {
      if (mongoose.Types.ObjectId.isValid(employeeId)) {
        query.employee = employeeId;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid employee ID' });
      };
    };

    // Handle pagination
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    // Handle sorting
    if (req.query.sort === 'Ascending') {
      sort = { startDate: 1 };
    } else {
      sort = { startDate: -1 };
    };

    // Calculate total count
    const totalCount = await LeaveApproval.countDocuments(query);

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

    return res.status(200).json({ success: true, data: leaveApprovals, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get a single leave approval request by ID
export const fetchSingleLeaveApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const leaveApproval = await LeaveApproval.findById(id)
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

// Update leave approval
export const updateLeaveApproval = async (req, res) => {
  try {
    const { leaveId, approverId, leaveStatus } = req.body;

    // Validations
    if (!leaveId) {
      return res.status(400).json({ success: false, message: "Leave ID is required." });
    };

    if (!approverId) {
      return res.status(400).json({ success: false, message: "Approver ID is required." });
    };

    if (!leaveStatus) {
      return res.status(400).json({ success: false, message: "Leave status is required." });
    };

    // Fetch the leave request
    const leaveRequest = await LeaveApproval.findById(leaveId)
      .populate("employee")
      .exec();

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: "Leave request not found." });
    };

    if (leaveRequest?.status === "Approved" || leaveRequest?.status === "Rejected") {
      return res.status(400).json({ success: false, message: "This leave request has already been processed." });
    };

    if (leaveRequest?.status === "Pending" && leaveStatus === "Pending") {
      return res.status(400).json({ success: false, message: "This leave request is already in pending." });
    };

    const employee = await Team.findById(leaveRequest?.employee?._id);
    const approveBy = await Team.findById(approverId);

    if (leaveStatus === "Rejected") {
      leaveRequest.leaveStatus = "Rejected";
      leaveRequest.leaveApprovedBy = approverId;
      await leaveRequest.save();
      sendEmail(employee?.email, "Your Leave Request Rejected", `<p>Your leave request from date ${leaveRequest?.startDate} to ${leaveRequest?.startDate} has been rejected.</p><p>Regards,<br/>${approveBy?.name}</p>`);
      return res.status(200).json({ success: true, message: "Leave request rejected." });
    };

    if (leaveStatus === "Approved") {
      leaveRequest.leaveStatus = "Approved";
      leaveRequest.leaveApprovedBy = approverId;
      await leaveRequest.save();

      const leaveDates = leaveRequest?.startDate.toString() === leaveRequest?.endDate.toString()
        ? [new Date(leaveRequest?.startDate)]
        : getDateRange(new Date(leaveRequest?.startDate), new Date(leaveRequest?.endDate));

      // Map leaveDates to create objects for approvedLeaves
      const approvedLeaveEntries = leaveDates.map((date) => ({
        date: date.toISOString().split("T")[0],
        approvedBy: approverId,
        reason: leaveRequest?.reason,
        isUtilized: false,
      }));

      // Update the approvedLeaves field in the `Team` schema
      await Team.findOneAndUpdate(
        { _id: employee?._id },
        { $push: { approvedLeaves: { $each: approvedLeaveEntries } } }
      );

      // Send email
      sendEmail(employee?.email, "Your Leave Request Approved", `<p>Your leave request from ${leaveRequest?.startDate} to ${leaveRequest?.endDate} has been approved.</p><p>Regards,<br/>${approveBy?.name}</p>`);
      return res.status(200).json({ success: true, message: "Leave request approved." });
    };

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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
