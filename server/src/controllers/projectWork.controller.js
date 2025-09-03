import mongoose from "mongoose";
import ProjectWork from "../models/projectWork.model.js";
import Project from "../models/project.model.js";
import Team from "../models/team.model.js";
import ProjectStatus from "../models/projectStatus.model.js";
import { sendEmail } from "../services/emailService.js";
import firebase from "../firebase/index.js";

// Create a new Project Work entry with transaction
export const createProjectWork = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { employee, project, status, date, description } = req.body;
    const company = req.company;

    if (!employee || !project || !status || !date || !description) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    };

    // Create project work entry
    const newWork = new ProjectWork({
      employee,
      project,
      status,
      date,
      description,
      company,
    });

    await newWork.save({ session });

    // Find and update project status
    const p = await Project
      .findOne({ _id: project, company })
      .session(session);

    if (!p) {
      throw new Error("Project not found.");
    };

    p.projectStatus = status;

    await p.save({ session });

    // Fetch project status details
    const s = await ProjectStatus
      .findOne({ _id: status, company })
      .session(session);

    if (!s) {
      throw new Error("Project status not found.");
    };

    // Fetch employee details
    const existingEmployee = await Team
      .findOne({ _id: employee, company })
      .session(session);

    if (!existingEmployee) {
      throw new Error("Employee not found.");
    };

    if (existingEmployee?.office?.noReplyEmail && existingEmployee?.office?.noReplyEmailAppPassword) {
      const from = existingEmployee?.office?.noReplyEmail;
      const to = from;
      const password = existingEmployee?.office?.noReplyEmailAppPassword;

      const subject = `${existingEmployee?.name} Updated Project Status on Date ${date}`;
      const htmlContent = `<p>${existingEmployee?.name} updated the project status to ${s?.status} for project ${p?.projectName} on date ${date}</p><p>Status: ${s?.status}</p><p>Description: ${description}</p>`;

      sendEmail(from, to, password, subject, htmlContent);
    };

    // Send push notification to admins
    const teams = await Company
      .find({ _id: existingEmployee?.company })
      .populate({ path: "role", select: "name" })
      .session(session);

    const filteredAdmins = teams?.filter((team) => team?.role?.name?.toLowerCase() === "company" && team?.fcmToken);

    if (filteredAdmins?.length > 0) {
      const payload = {
        notification: {
          title: `${existingEmployee?.name} Updated Project Status`,
          body: `Updated project status to ${s?.status} for project ${p?.projectName}`,
        },
      };

      await Promise.allSettled(
        filteredAdmins?.map((admin) => firebase.messaging().send({ ...payload, token: admin?.fcmToken }))
      );
    };

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ success: true, data: newWork });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get all Project Work entries with filtering, searching, sorting, and pagination
export const getProjectWorks = async (req, res) => {
  try {
    let { page, limit, sort, search, project, status, employee, date } = req.query;

    const query = { company: req.company };

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
      .findOne({ _id: id, company: req.company })
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

    const pipeline = [
      {
        $match: {
          project: new mongoose.Types.ObjectId(projectId),
          company: req.company
        },
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
      .findOneAndUpdate({ _id: id, company: req.company }, req.body, { new: true, runValidators: true });

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

    const deletedWork = await ProjectWork.findOneAndDelete({ _id: id, company: req.company });

    if (!deletedWork) {
      return res.status(404).json({ success: false, message: "Project Work not found" });
    };

    return res.json({ success: true, message: "Project Work deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};
