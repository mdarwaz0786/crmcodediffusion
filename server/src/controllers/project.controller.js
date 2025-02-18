import Project from "../models/project.model.js";
import ProjectId from "../models/projectId.model.js";
import mongoose from "mongoose";

// Helper function to generate the next projectId
const getNextProjectId = async () => {
  const counter = await ProjectId.findOneAndUpdate(
    { _id: "projectId" },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true },
  );
  return `CD${counter.sequence.toString().padStart(3, "0")}`;
};

// Helper function to calculate the difference in hours
const calculateHourDifference = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return;
  };

  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const startDate = new Date(0, 0, 0, startHours, startMinutes);
  const endDate = new Date(0, 0, 0, endHours, endMinutes);
  return (endDate - startDate) / (1000 * 60 * 60);
};

// Helper function to find ObjectId by string in referenced models
const findObjectIdByString = async (modelName, fieldName, searchString) => {
  const Model = mongoose.model(modelName);
  const result = await Model.findOne({ [fieldName]: { $regex: new RegExp(searchString, 'i') } }).select('_id');
  return result ? result._id : null;
};

// Helper function to find ObjectId array by string in referenced models
const findObjectIdArrayByString = async (modelName, fieldName, searchString) => {
  const Model = mongoose.model(modelName);
  const results = await Model.find({ [fieldName]: { $regex: new RegExp(searchString, 'i') } }).select('_id');
  return results.map((result) => result._id);
};

// Controller for creating a project
export const createProject = async (req, res) => {
  try {
    const { ...projectData } = req.body;

    // Create a new project without projectId initially
    const project = new Project({ ...projectData });
    await project.save();

    // Generate the next projectId only after successful save
    const projectId = await getNextProjectId();

    // Update the project document with the generated projectId
    project.projectId = projectId;
    await project.save();

    return res.status(201).json({ success: true, message: "Project created successfully", project });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while creating project: ${error.message}` });
  };
};

// Controller for fetching all project
export const fetchAllProject = async (req, res) => {
  try {
    let filter = {};
    let sort = {};

    // Check if the role is not "Coordinator" or "Admin"
    const teamRole = req.team.role.name.toLowerCase();
    if (teamRole !== "coordinator" && teamRole !== "admin") {
      const teamId = req.team._id;
      filter.$or = [
        { teamLeader: { $in: [teamId] } },
        { responsiblePerson: { $in: [teamId] } },
        { customer: teamId },
      ];
    };

    // Handle searching across all fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), "i");
      const searchFilter = [
        { projectName: { $regex: searchRegex } },
        { projectId: { $regex: searchRegex } },
        { projectDeadline: { $regex: searchRegex } },
        { customer: await findObjectIdByString("Customer", "name", req.query.search.trim()) },
        { projectType: await findObjectIdByString("ProjectType", "name", req.query.search.trim()) },
        { projectCategory: await findObjectIdByString("ProjectCategory", "name", req.query.search.trim()) },
        { projectStatus: await findObjectIdByString("ProjectStatus", "status", req.query.search.trim()) },
        { projectPriority: await findObjectIdByString("ProjectPriority", "name", req.query.search.trim()) },
        { responsiblePerson: { $in: await findObjectIdArrayByString("Team", "name", req.query.search.trim()) } },
        { teamLeader: { $in: await findObjectIdArrayByString("Team", "name", req.query.search.trim()) } },
        { technology: { $in: await findObjectIdArrayByString("Technology", "name", req.query.search.trim()) } },
      ];

      filter.$and = [{ $or: searchFilter }];
    };

    // Handle project name search
    if (req.query.projectName) {
      filter.projectName = { $regex: new RegExp(req.query.projectName.trim(), 'i') };
    };

    // Handle project name filter
    if (req.query.projectNameFilter) {
      filter.projectName = { $in: Array.isArray(req.query.projectNameFilter) ? req.query.projectNameFilter : [req.query.projectNameFilter] };
    };

    // Handle project status filter
    if (req.query.statusFilter) {
      filter.projectStatus = { $in: Array.isArray(req.query.statusFilter) ? req.query.statusFilter : [req.query.statusFilter] };
    };

    // Handle projectId search
    if (req.query.projectId) {
      filter.projectId = { $regex: new RegExp(req.query.projectId.trim(), 'i') };
    };

    // Handle projectId filter
    if (req.query.projectIdFilter) {
      filter.projectId = { $in: Array.isArray(req.query.projectIdFilter) ? req.query.projectIdFilter : [req.query.projectIdFilter] };
    };

    // Handle date range filter
    if (req.query.dateRange) {
      const [startDateString, endDateString] = req.query.dateRange.split(" - ");
      const formatStartDate = startDateString.split("-");
      const formatEndDate = endDateString.split("-");

      const startDate = new Date(`${formatStartDate[2]}-${formatStartDate[1]}-${formatStartDate[0]}T00:00:00Z`);
      const endDate = new Date(`${formatEndDate[2]}-${formatEndDate[1]}-${formatEndDate[0]}T23:59:59Z`);

      filter.createdAt = { $gte: startDate, $lte: endDate };
    };

    // Handle sorting
    if (req.query.sort === 'Ascending') {
      sort = { createdAt: 1 };
    } else {
      sort = { createdAt: -1 };
    };

    // Handle pagination
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const project = await Project.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({ path: "customer", select: "" })
      .populate({ path: "projectType", select: "name" })
      .populate({ path: "projectCategory", select: "name" })
      .populate({ path: "projectTiming", select: "name" })
      .populate({ path: "projectPriority", select: "name" })
      .populate({ path: "projectStatus", select: "status" })
      .populate({ path: "responsiblePerson", select: "name" })
      .populate({ path: "teamLeader", select: "name" })
      .populate({ path: "technology", select: "name" })
      .populate({ path: "workDetail.teamMember", select: "name" })
      .populate({ path: "payment.teamMember", select: "name" })
      .exec();

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    };

    const totalCount = await Project.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All project fetched successfully", project, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching all project: ${error.message}` });
  };
};

// Controller for fetching a single project
export const fetchSingleProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findById(projectId)
      .populate({ path: "customer", select: "" })
      .populate({ path: "projectType", select: "name" })
      .populate({ path: "projectCategory", select: "name" })
      .populate({ path: "projectTiming", select: "name" })
      .populate({ path: "projectPriority", select: "name" })
      .populate({ path: "projectStatus", select: "status" })
      .populate({ path: "responsiblePerson", select: "name" })
      .populate({ path: "teamLeader", select: "name" })
      .populate({ path: "technology", select: "name" })
      .populate({ path: "workDetail.teamMember", select: "name" })
      .populate({ path: "payment.teamMember", select: "name" })
      .exec();

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    };

    return res.status(200).json({ success: true, message: "Single project fetched successfully", project });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching single project: ${error.message}` });
  };
};

// Fetch work details based on projectId, current date, month, year and employeeId
export const fetchWorkDetail = async (req, res) => {
  try {
    const { projectId, date, year, month, employeeId, page = 1, limit = 10 } = req.query;
    const match = {};

    // Filter by projectId if provided
    if (projectId) {
      match._id = new mongoose.Types.ObjectId(projectId);
    };

    // Filter by date if provided
    if (date) {
      match["workDetail.date"] = date;
    };

    // Filter by year if provided (no month)
    if (year && !month) {
      match["workDetail.date"] = {
        $gte: `${year}-01-01`,
        $lte: `${year}-12-31`,
      };
    };

    // Filter by month if provided (all years)
    if (month && !year) {
      match["workDetail.date"] = { $regex: `-${month}-`, $options: "i" };
    };

    // Filter by both year and month
    if (year && month) {
      match["workDetail.date"] = {
        $gte: `${year}-${month}-01`,
        $lte: `${year}-${month}-31`,
      };
    };

    // Filter by employeeId if provided
    if (employeeId) {
      match["workDetail.teamMember"] = new mongoose.Types.ObjectId(employeeId);
    };

    // Aggregate query to fetch paginated work details
    const result = await Project.aggregate([
      { $unwind: "$workDetail" },
      { $match: match },
      {
        $sort: {
          "workDetail.date": 1,
        },
      },
      {
        $group: {
          _id: "$workDetail.teamMember",
          workDetails: {
            $push: {
              projectId: "$_id",
              projectName: "$projectName",
              startTime: "$workDetail.startTime",
              endTime: "$workDetail.endTime",
              workDescription: "$workDetail.workDescription",
              date: "$workDetail.date",
            },
          },
        },
      },
      {
        $lookup: {
          from: "teams",
          localField: "_id",
          foreignField: "_id",
          as: "teamMemberInfo",
        },
      },
      {
        $addFields: {
          teamMember: { $first: "$teamMemberInfo" },
        },
      },
      {
        $sort: {
          "teamMember.name": 1,
        },
      },
      {
        $project: {
          _id: 0,
          "teamMember._id": 1,
          "teamMember.name": 1,
          workDetails: 1,
        },
      },
    ]);

    // Calculate the total count
    const totalCount = result.length;

    // Apply pagination
    const paginatedResult = result.slice((page - 1) * limit, page * limit);

    // Send response with the result and the total count
    return res.status(200).json({ success: true, message: "Work detail fetched successfully", data: paginatedResult, totalCount: totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error while fetching work details", error: error.message });
  };
};

// Controller for updating a project with work detail and payment 
export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { workDetail = [], payment = [], projectPrice, totalHour, ...projectData } = req.body;
    const teamMemberId = req.teamId;

    // Find the project by ID
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    };

    // Handle work detail update
    if (workDetail && workDetail.length > 0) {
      // Calculate existing total hour worked
      let totalHourWorked = project.workDetail.reduce((total, work) => {
        if (work.startTime && work.endTime) {
          return total + calculateHourDifference(work.startTime, work.endTime);
        };
        return total;
      }, 0);

      // Calculate total hour for the new workDetail entry
      const newWorkedHour = workDetail.reduce((total, work) => {
        if (work.startTime && work.endTime) {
          return total + calculateHourDifference(work.startTime, work.endTime);
        };
        return total;
      }, 0);

      project.totalSpentHour = parseFloat(totalHourWorked) + parseFloat(newWorkedHour);
      project.totalRemainingHour = parseFloat(project.totalHour) - parseFloat(project.totalSpentHour);

      // Add new work detail to the project
      project.workDetail = [...project.workDetail, ...workDetail.map((work) => ({
        teamMember: teamMemberId,
        startTime: work.startTime,
        endTime: work.endTime,
        workDescription: work.workDescription,
        date: work.date,
      }))];
    };

    // Handle total hour update
    if (totalHour) {
      project.totalRemainingHour = parseFloat(totalHour) - parseFloat(project.totalSpentHour);
    };

    // Handle payment update
    if (payment && payment.length > 0) {
      // Calculate existiong total paid
      const existingTotalPaid = project.payment.reduce((total, pay) => total + parseFloat(pay.amount), 0);

      // Calculate total for the new payment entry
      const newPaymentTotal = payment.reduce((total, pay) => total + parseFloat(pay.amount), 0);

      project.totalPaid = parseFloat(existingTotalPaid) + parseFloat(newPaymentTotal);
      project.totalDues = parseFloat(project.projectPrice) - parseFloat(project.totalPaid);

      // Add new payment to the project
      project.payment = [...project.payment, ...payment.map((pay) => ({
        teamMember: teamMemberId,
        amount: parseFloat(pay.amount),
        date: pay.date,
      }))];
    };

    // Handle project price update
    if (projectPrice) {
      project.totalDues = parseFloat(projectPrice) - parseFloat(project.totalPaid);
    };

    // Update other project detail
    const updatedProject = await Project.findByIdAndUpdate(projectId,
      {
        ...projectData,
        projectPrice,
        totalHour,
        payment: project.payment,
        totalPaid: project.totalPaid,
        totalDues: project.totalDues,
        workDetail: project.workDetail,
        totalSpentHour: project.totalSpentHour,
        totalRemainingHour: project.totalRemainingHour,
      },
      {
        new: true,
      },
    );

    if (!updatedProject) {
      return res.status(404).json({ success: false, message: "Project not found" });
    };

    return res.status(200).json({ success: true, message: "Project updated successfully", project: updatedProject });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while updating project: ${error.message}` });
  };
};

// Controller for deleting a project
export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    };

    return res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while deleting project: ${error.message}` });
  };
};
