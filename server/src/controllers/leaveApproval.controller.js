import LeaveApproval from "../models/leaveApproval.model.js";
import Team from "../models/team.model.js";
import Attendance from "../models/attendance.model.js";
import mongoose from "mongoose";

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
    const { employee, startDate, endDate, leaveType, leaveApprovedBy, leaveStatus, reason } = req.body;

    // List of required fields
    const requiredFields = ['employee', 'startDate', 'endDate', 'leaveType', 'reason'];

    // Check if any required field is missing or empty
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ success: false, message: `${field} is required` });
      };
    };

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ success: false, message: "Start date cannot be later than the end date" });
    };

    // Check if the employee exist
    const existingEmployee = await Team.findById(employee);
    if (!existingEmployee) {
      return res.status(400).json({ success: false, message: "Employee not found" });
    };

    // Check for overlapping leave request
    const overlappingLeave = await LeaveApproval.findOne({
      employee,
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
      ],
    });

    if (overlappingLeave) {
      return res.status(400).json({ success: false, message: "Leave already exists for the given dates" });
    };

    const leaveDuration = getDateRange(startDate, endDate);

    const newLeaveApproval = new LeaveApproval({
      employee,
      startDate,
      endDate,
      leaveType,
      leaveApprovedBy,
      leaveStatus,
      leaveDuration: leaveDuration.length,
      reason,
    });

    await newLeaveApproval.save();
    res.status(201).json({ success: true, message: "Leave approval request created successfully", data: newLeaveApproval });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating leave approval request", error: error.message });
  };
};

// Get all leave approvals
export const fetchAllLeaveApproval = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    const query = {};
    let sort = {};

    // Filter by exact startDate and endDate if provided
    if (startDate && endDate) {
      query.startDate = { $gte: startDate };
      query.endDate = { $lte: endDate };
    } else if (startDate) {
      query.startDate = { $gte: startDate };
    } else if (endDate) {
      query.endDate = { $lte: endDate };
    };

    // Filter by year only
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

    // Filter by employee ID if provided
    if (employeeId) {
      if (mongoose.Types.ObjectId.isValid(employeeId)) {
        query.employee = employeeId;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid employee ID' });
      };
    };

    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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
      .populate("employee", "name")
      .populate("leaveApprovedBy", "name")
      .exec();

    if (!leaveApprovals) {
      return res.status(404).json({ success: false, message: 'Leave approvals not found' });
    };

    return res.status(200).json({ success: true, data: leaveApprovals, totalCount });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get a single leave approval request by ID
export const fetchSingleLeaveApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const leaveApproval = await LeaveApproval.findById(id)
      .populate("employee", "name")
      .populate("leaveApprovedBy", "name");

    if (!leaveApproval) {
      return res.status(404).json({ success: false, message: "Leave approval request not found" });
    };
    res.status(200).json({ success: true, data: leaveApproval });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error while fetching leave approval request", error: error.message });
  };
};

// Update leave approval
export const updateLeaveApproval = async (req, res) => {
  try {
    const { leaveId, approverId, leaveStatus } = req.body;

    // Validations
    if (!leaveId || !approverId || !leaveStatus) {
      return res.status(400).json({ success: false, message: "Leave ID, approver ID, and leave status are required." });
    };

    // Fetch the leave request
    const leaveRequest = await LeaveApproval.findById(leaveId);

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: "Leave request not found." });
    };

    // If leave status is "Approved", handle the approval and attendance marking
    if (leaveStatus === "Approved") {
      // Check if the leave is already approved or rejected
      if (leaveRequest.leaveStatus === "Approved") {
        return res.status(400).json({ success: false, message: "Leave request is already processed." });
      };

      // Update the leave status to "Approved" and save
      leaveRequest.leaveStatus = "Approved";
      leaveRequest.leaveApprovedBy = approverId;
      await leaveRequest.save();

      // Mark status as On Leave in attendance
      const { employee, startDate, endDate } = leaveRequest;

      // If it is a single day leave, set the date range to just the start date
      const datesToUpdate = startDate.toString() === endDate.toString()
        ? [new Date(startDate)]
        : getDateRange(new Date(startDate), new Date(endDate));

      const updateAttendancePromises = datesToUpdate.map(async (date) => {
        const formattedDate = date.toISOString().split('T')[0];

        const existingAttendance = await Attendance.findOne({
          employee,
          attendanceDate: formattedDate,
        });

        // If attendance already exists and the status is "Sunday" or "Holiday", or "Present" skip
        if (existingAttendance && (existingAttendance.status === "Sunday" || existingAttendance.status === "Holiday" || existingAttendance.status === "Present")) {
          return;
        };

        // Create or update the attendance record
        await Attendance.findOneAndUpdate(
          {
            employee,
            attendanceDate: formattedDate,
          },
          {
            $set: {
              status: "On Leave",
              punchInTime: null,
              punchIn: true,
              punchOutTime: null,
              punchOut: true,
              hoursWorked: null,
              lateIn: null,
            },
          },
          {
            upsert: true,
            new: true,
          },
        );
      });

      // Wait for all attendance updates to be completed
      await Promise.all(updateAttendancePromises);

      return res.status(200).json({ success: true, message: "Leave approved and marked attendance as On Leave" });
    } else {
      // If the leave status is changed from "Approved" to "Rejected" or "Pending", delete all associated attendance records
      if (leaveRequest.leaveStatus === "Approved" && (leaveStatus === "Rejected" || leaveStatus === "Pending")) {
        const { employee, startDate, endDate } = leaveRequest;

        // Get the date range for attendance deletion
        const datesToDelete = startDate.toString() === endDate.toString()
          ? [new Date(startDate)]
          : getDateRange(new Date(startDate), new Date(endDate));

        const deleteAttendancePromises = datesToDelete.map(async (date) => {
          const formattedDate = date.toISOString().split('T')[0];
          await Attendance.deleteOne({ employee, attendanceDate: formattedDate, status: "On Leave" });
        });

        // Wait for all attendance deletions to be completed
        await Promise.all(deleteAttendancePromises);
      };

      // Update the leave status and save
      leaveRequest.leaveStatus = leaveStatus;
      leaveRequest.leaveApprovedBy = approverId;
      await leaveRequest.save();

      return res.status(200).json({ success: true, message: "Leave status updated successfully, and attendance records cleared if applicable." });
    };
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: error.message });
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
    res.status(200).json({ success: true, message: "Leave approval request deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error while deleting leave approval request", error: error.message });
  };
};
