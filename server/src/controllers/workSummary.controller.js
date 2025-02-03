import mongoose from "mongoose";
import WorkSummary from "../models/workSummary.model.js";

// Create WorkSummary
export const createWorkSummary = async (req, res) => {
  try {
    const { employee, date, summary } = req.body;

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee is required" });
    };

    if (!date) {
      return res.status(404).json({ success: false, message: "Date is required" });
    };

    if (!summary) {
      return res.status(404).json({ success: false, message: "Summary is required" });
    };

    const newWorkSummary = new WorkSummary({ employee, date, summary });
    await newWorkSummary.save();

    return res.status(201).json({ success: true, data: newWorkSummary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get All WorkSummaries
export const getAllWorkSummaries = async (req, res) => {
  try {
    const workSummaries = await WorkSummary
      .find()
      .populate('employee');

    if (!workSummaries) {
      return res.status(404).json({ success: false, message: "Work summary not found" });
    };

    return res.status(200).json({ success: true, data: workSummaries });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get WorkSummary by ID
export const getWorkSummaryById = async (req, res) => {
  try {
    const workSummary = await WorkSummary
      .findById(req.params.id)
      .populate('employee');

    if (!workSummary) {
      return res.status(404).json({ success: false, message: "Work summary not found" });
    };

    return res.status(200).json({ success: true, data: workSummary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Group work summary by employee
export const groupWorkSummaryByEmployee = async (req, res) => {
  try {
    let query = {};
    let sort = {};

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    // Filter by year only (all months)
    if (req.query.year && !req.query.month) {
      const year = req.query.year;
      query.date = {
        $gte: `${year}-01-01`,
        $lte: `${year}-12-31`,
      };
    };

    // Filter by month only (all years)
    if (req.query.month && !req.query.year) {
      const month = req.query.month;
      query.date = { $regex: `-${month}-`, $options: "i" };
    };

    // Filter by both year and month
    if (req.query.year && req.query.month) {
      const year = req.query.year;
      const month = req.query.month;

      query.date = {
        $gte: `${year}-${month}-01`,
        $lte: `${year}-${month}-31`,
      };
    };

    // Filter by employee
    if (req.query.employee) {
      query.employee = new mongoose.Types.ObjectId(req.query.employee);
    };

    // Search by summary field
    if (req.query.search) {
      const searchQuery = req.query.search.trim();
      query.summary = { $regex: searchQuery, $options: "i" };
    };

    // Aggregation pipeline to group work summaries by employee name
    const groupedSummaries = await WorkSummary.aggregate([
      {
        $match: query, // Apply filters from query params
      },
      {
        $sort: {
          "date": -1,
        },
      },
      {
        $lookup: {
          from: "teams", // Join with the "teams" collection
          localField: "employee",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $unwind: "$employeeDetails", // Unwind the employee details
      },
      {
        $group: {
          _id: "$employeeDetails.name", // Group by employee name
          workSummaries: {
            $push: {
              date: "$date",
              summary: "$summary",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          employeeName: "$_id",
          workSummaries: 1,
        },
      },
      {
        $sort: {
          employeeName: 1,
        },
      },
    ]);

    // If no results found
    if (!groupedSummaries) {
      return res.status(404).json({ success: false, message: "No work summaries found." });
    };

    // Calculate the total count
    const total = groupedSummaries.length;

    // Apply pagination
    const paginatedResult = groupedSummaries.slice((page - 1) * limit, page * limit);

    // Return the response with the grouped summaries
    return res.status(200).json({ success: true, data: paginatedResult, totalCount: total });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Fetch Today's WorkSummary
export const getTodayWorkSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const todayWorkSummary = await WorkSummary
      .find({ date: today })
      .populate('employee', 'name');

    if (!todayWorkSummary) {
      return res.status(404).json({ success: false, message: "Work summary not found" });
    };

    return res.status(200).json({ success: true, data: todayWorkSummary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Update WorkSummary
export const updateWorkSummary = async (req, res) => {
  try {
    const updatedWorkSummary = await WorkSummary.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedWorkSummary) {
      return res.status(404).json({ success: false, message: "Work summary not found" });
    };

    return res.status(200).json({ success: true, data: updatedWorkSummary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Delete WorkSummary
export const deleteWorkSummary = async (req, res) => {
  try {
    const deletedWorkSummary = await WorkSummary
      .findByIdAndDelete(req.params.id);

    if (!deletedWorkSummary) {
      return res.status(404).json({ success: false, message: "Work summary not found" });
    };

    return res.status(200).json({ success: true, message: "Work summary deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};