import mongoose from "mongoose";
import WorkSummary from "../models/workSummary.model.js";
import Team from "../models/team.model.js";
import Company from "../models/company.model.js";
import { sendEmail } from "../services/emailService.js";
import firebase from "../firebase/index.js";

// Create WorkSummary
export const createWorkSummary = async (req, res) => {
  try {
    const { employee, date, summary } = req.body;
    const company = req.company;

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee is required" });
    };

    if (!date) {
      return res.status(404).json({ success: false, message: "Date is required" });
    };

    if (!summary) {
      return res.status(404).json({ success: false, message: "Summary is required" });
    };

    const newWorkSummary = new WorkSummary({ employee, date, summary, company });
    await newWorkSummary.save();

    // Send email
    const existingEmployee = await Team.findOne({ _id: employee, company }).populate("office");

    if (existingEmployee?.office?.noReplyEmail && existingEmployee?.office?.noReplyEmailAppPassword) {
      const from = existingEmployee?.office?.noReplyEmail;
      const to = from;
      const password = existingEmployee?.office?.noReplyEmailAppPassword;

      const subject = `${existingEmployee?.name} Work Summary for Date ${date}`;
      const htmlContent = `</p>${summary}</p>`;

      sendEmail(from, to, password, subject, htmlContent);
    };

    // Send push notification to admin
    const teams = await Company
      .find({ _id: existingEmployee?.company })
      .populate({ path: 'role', select: "name" })
      .exec();

    const filteredAdmins = teams?.filter((team) => team?.role?.name?.toLowerCase() === "company" && team?.fcmToken);

    if (filteredAdmins?.length > 0) {
      const payload = {
        notification: {
          title: `${existingEmployee?.name} Work Summary`,
          body: `${summary}`,
        },
      };

      await Promise.allSettled(filteredAdmins?.map((admin) => firebase.messaging().send({ ...payload, token: admin?.fcmToken })));
    };

    return res.status(201).json({ success: true, data: newWorkSummary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get All WorkSummaries
export const getAllWorkSummaries = async (req, res) => {
  try {
    const workSummaries = await WorkSummary
      .find({ company: req.company })
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
      .findOne({ _id: req.params.id, company: req.company })
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
    let query = { company: req.company };

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

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
        $match: query,
      },
      {
        $sort: {
          "date": -1,
        },
      },
      {
        $lookup: {
          from: "teams",
          localField: "employee",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $unwind: "$employeeDetails",
      },
      {
        $group: {
          _id: "$employeeDetails.name",
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
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Fetch Today's WorkSummary
export const getTodayWorkSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const todayWorkSummary = await WorkSummary
      .find({ date: today, company: req.company })
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
    const updatedWorkSummary = await WorkSummary
      .findOneAndUpdate(
        { _id: req.params.id, company: req.company },
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
      .findOneAndDelete({ _id: req.params.id, company: req.company });

    if (!deletedWorkSummary) {
      return res.status(404).json({ success: false, message: "Work summary not found" });
    };

    return res.status(200).json({ success: true, message: "Work summary deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};