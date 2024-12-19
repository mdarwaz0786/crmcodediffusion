import LeaveApproval from "../models/leaveApproval.model.js";
import Team from "../models/team.model.js";

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
    const { employee, startDate, endDate, leaveType, leaveApprovedBy, leaveStatus } = req.body;

    // List of required fields
    const requiredFields = ['employee', 'startDate', 'endDate', 'leaveType'];

    // Check if any required field is missing or empty
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ success: false, message: `${field} is required` });
      };
    };

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ success: false, message: "Start date cannot be after end date" });
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
    });

    await newLeaveApproval.save();
    res.status(201).json({ success: true, message: "Leave approval request created successfully", data: newLeaveApproval });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating leave approval request", error: error.message });
  };
};

// Get all leave approval request
export const fetchAllLeaveApproval = async (req, res) => {
  try {
    const leaveApproval = await LeaveApproval.find()
      .populate("employee", "name")
      .populate("leaveApprovedBy", "name");

    res.status(200).json({ success: true, data: leaveApproval });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error while fetching leave approval request", error: error.message });
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

// Update a leave approval request
export const updateLeaveApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, leaveType, leaveApprovedBy, leaveStatus } = req.body;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ success: false, message: "Start date cannot be after end date" });
    };

    const leaveDuration = getDateRange(startDate, endDate);

    const updatedLeaveApproval = await LeaveApproval.findByIdAndUpdate(
      id,
      {
        startDate,
        endDate,
        leaveType,
        leaveApprovedBy,
        leaveStatus,
        leaveDuration: leaveDuration.length,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedLeaveApproval) {
      return res.status(404).json({ success: false, message: "Leave approval request not found" });
    };
    res.status(200).json({ success: true, message: "Leave approval request updated successfully", data: updatedLeaveApproval });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error while updating leave approval request", error: error.message });
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
