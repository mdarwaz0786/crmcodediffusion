import mongoose from "mongoose";
import ProjectWork from "../models/projectWork.model.js";

// Create a new Project Work entry
export const createProjectWork = async (req, res) => {
  try {
    const { employee, project, status, date, description } = req.body;

    if (!employee || !project || !status || !date || !description) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    };

    const newWork = new ProjectWork({
      employee,
      project,
      status,
      date,
      description,
    });

    await newWork.save();
    return res.status(201).json({ success: true, data: newWork });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get all Project Work entries with filtering, searching, sorting, and pagination
export const getProjectWorks = async (req, res) => {
  try {
    let { page, limit, sort, search, project, status, employee, date } = req.query;

    const query = {};

    if (project) {
      query.project = project;
    };

    if (status) {
      query.status = status;
    };

    if (employee) {
      query.employee = employee;
    };

    if (date) {
      query.date = date;
    };

    if (search) {
      query.description = { $regex: search, $options: "i" };
    };

    page = parseInt(page);
    limit = parseInt(limit);
    let skip = (page - 1) * limit;
    sort = sort ? { [sort]: 1 } : { createdAt: -1 };

    const total = await ProjectWork.countDocuments(query);

    const works = await ProjectWork
      .find(query)
      .populate("employee project status")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (!works) {
      return res.status(404).json({ success: false, message: "Project work not found." });
    };

    return res.json({ success: true, total, page, limit, data: works });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get a single Project Work entry
export const getProjectWorkById = async (req, res) => {
  try {
    const { id } = res.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Id is required" });
    };

    const work = await ProjectWork
      .findById(id)
      .populate("employee project status");

    if (!work) {
      return res.status(404).json({ success: false, message: "Project Work not found" });
    };

    return res.json({ success: true, data: work });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Project work group by employee name
export const getGroupedProjectWork = async (req, res) => {
  try {
    let { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ success: false, message: "Project ID is required" });
    };

    projectId = new mongoose.Types.ObjectId(projectId);

    const pipeline = [
      {
        $match: { project: projectId },
      },
      {
        $lookup: {
          from: "teams",
          localField: "employee",
          foreignField: "_id",
          as: "employeeData",
        },
      },
      {
        $unwind: { path: "$employeeData", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "projectstatuses",
          localField: "status",
          foreignField: "_id",
          as: "statusData",
        },
      },
      {
        $unwind: { path: "$statusData", preserveNullAndEmptyArrays: true },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$employee",
          employeeName: { $first: "$employeeData.name" },
          projectWorks: {
            $push: {
              _id: "$_id",
              project: "$project",
              status: "$statusData.status",
              date: "$date",
              description: "$description",
              createdAt: "$createdAt",
            },
          },
        },
      },
      {
        $sort: { employeeName: 1 },
      },
      {
        $project: {
          _id: 1,
          employeeName: 1,
          projectWorks: 1,
        },
      },
    ];

    const result = await ProjectWork.aggregate(pipeline);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  };
};

// Update a Project Work entry
export const updateProjectWork = async (req, res) => {
  try {
    const { id } = res.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Id is required" });
    };

    const updatedWork = await ProjectWork
      .findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedWork) {
      return res.status(404).json({ success: false, message: "Project Work not found" });
    };

    return res.json({ success: true, data: updatedWork });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Delete a Project Work entry
export const deleteProjectWork = async (req, res) => {
  try {
    const { id } = res.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Id is required" });
    };

    const deletedWork = await ProjectWork.findByIdAndDelete(id);

    if (!deletedWork) {
      return res.status(404).json({ success: false, message: "Project Work not found" });
    };

    return res.json({ success: true, message: "Project Work deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};
