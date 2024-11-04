import LeaveApproval from "../models/leaveApproval.model.js"; // Adjust the import path as per your project structure

// Create a new leave approval request
export const createLeaveApproval = async (req, res) => {
  try {
    const { employee, startDate, endDate, leaveType, leaveApprovedBy, leaveStatus } = req.body;

    const newLeaveApproval = new LeaveApproval({
      employee,
      startDate,
      endDate,
      leaveType,
      leaveApprovedBy,
      leaveStatus,
    });

    await newLeaveApproval.save();
    res.status(201).json({ message: "Leave approval request created successfully", data: newLeaveApproval });
  } catch (error) {
    res.status(500).json({ message: "Error creating leave approval request", error: error.message });
  }
};

// Get all leave approval requests
export const fetchAllLeaveApproval = async (req, res) => {
  try {
    const leaveApprovals = await LeaveApproval.find()
      .populate("employee", "name") // Populate employee details
      .populate("leaveApprovedBy", "name"); // Populate approver details

    res.status(200).json({ data: leaveApprovals });
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave approval requests", error: error.message });
  }
};

// Get a single leave approval request by ID
export const fetchSingleLeaveApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const leaveApproval = await LeaveApproval.findById(id)
      .populate("employee", "name")
      .populate("leaveApprovedBy", "name");

    if (!leaveApproval) {
      return res.status(404).json({ message: "Leave approval request not found" });
    }
    res.status(200).json({ data: leaveApproval });
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave approval request", error: error.message });
  }
};

// Update a leave approval request (for status update or other details)
export const updateLeaveApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, leaveType, leaveApprovedBy, leaveStatus } = req.body;

    const updatedLeaveApproval = await LeaveApproval.findByIdAndUpdate(
      id,
      {
        startDate,
        endDate,
        leaveType,
        leaveApprovedBy,
        leaveStatus,
      },
      { new: true, runValidators: true }
    );

    if (!updatedLeaveApproval) {
      return res.status(404).json({ message: "Leave approval request not found" });
    }
    res.status(200).json({ message: "Leave approval request updated successfully", data: updatedLeaveApproval });
  } catch (error) {
    res.status(500).json({ message: "Error updating leave approval request", error: error.message });
  }
};

// Delete a leave approval request
export const deleteLeaveApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLeaveApproval = await LeaveApproval.findByIdAndDelete(id);
    if (!deletedLeaveApproval) {
      return res.status(404).json({ message: "Leave approval request not found" });
    }
    res.status(200).json({ message: "Leave approval request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting leave approval request", error: error.message });
  }
};
