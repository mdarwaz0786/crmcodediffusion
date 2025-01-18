import WorkSummary from "../models/workSummary.model.js";

// Create WorkSummary
export const createWorkSummary = async (req, res) => {
  try {
    const { employee, date, summary } = req.body;
    const newWorkSummary = new WorkSummary({ employee, date, summary });
    await newWorkSummary.save();
    res.status(201).json({ success: true, data: newWorkSummary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Get All WorkSummaries
export const getAllWorkSummaries = async (req, res) => {
  try {
    const workSummaries = await WorkSummary.find().populate('employee');
    res.status(200).json({ success: true, data: workSummaries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Get WorkSummary by ID
export const getWorkSummaryById = async (req, res) => {
  try {
    const workSummary = await WorkSummary.findById(req.params.id).populate('employee');
    if (!workSummary) {
      return res.status(404).json({ success: false, message: "Work summary not found" });
    };
    res.status(200).json({ success: true, data: workSummary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Fetch Today's WorkSummary
export const getTodayWorkSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayWorkSummary = await WorkSummary.find({ date: today }).populate('employee', 'name');
    res.status(200).json({ success: true, data: todayWorkSummary });
  } catch (error) {
    res.status(500).json({ message: "Error fetching today's work summary", error: error.message });
  };
};

// Update WorkSummary
export const updateWorkSummary = async (req, res) => {
  try {
    const updatedWorkSummary = await WorkSummary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedWorkSummary) {
      return res.status(404).json({ success: false, message: "Work summary not found" });
    };
    res.status(200).json({ success: true, data: updatedWorkSummary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Delete WorkSummary
export const deleteWorkSummary = async (req, res) => {
  try {
    const deletedWorkSummary = await WorkSummary.findByIdAndDelete(req.params.id);
    if (!deletedWorkSummary) {
      return res.status(404).json({ success: false, message: "Work summary not found" });
    };
    res.status(200).json({ success: true, message: "Work summary deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};