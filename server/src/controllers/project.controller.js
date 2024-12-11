import Project from "../models/project.model.js";
import ProjectId from "../models/projectId.model.js";
import mongoose from "mongoose";

// Helper function to generate the next projectId
const getNextProjectId = async () => {
  const counter = await ProjectId.findOneAndUpdate({ _id: "projectId" }, { $inc: { sequence: 1 } }, { new: true, upsert: true });
  return `CD${counter.sequence.toString().padStart(3, "0")}`;
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
    console.log("Error while creating project:", error.message);
    return res.status(500).json({ success: false, message: `Error while creating project: ${error.message}` });
  };
};

// Helper function to build the projection object based on user permissions
const buildProjection = (permissions) => {
  const projectFields = permissions.project.fields;
  const projection = {};

  for (const [key, value] of Object.entries(projectFields)) {
    if (value.show) {
      projection[key] = 1;
    } else {
      projection[key] = 0;
    };
  };

  // Ensure _id, createdAt and updatedAt are included by default unless explicitly excluded
  projection._id = 1;
  projection.createdAt = 1;
  projection.updatedAt = 1;

  return projection;
};

// Helper function to filter fields based on projection
const filterFields = (project, projection) => {
  const filteredProject = {};

  for (const key in project._doc) {
    if (projection[key] !== 0) {   // only exclude if explicitly set to 0
      filteredProject[key] = project[key];
    };
  };

  // Include _id, createdAt, and updatedAt if they were not excluded
  if (projection._id !== 0) {
    filteredProject._id = project._id;
  };

  if (projection.createdAt !== 0) {
    filteredProject.createdAt = project.createdAt;
  };

  if (projection.updatedAt !== 0) {
    filteredProject.updatedAt = project.updatedAt;
  };

  return filteredProject;
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

// Controller for fetching all project
export const fetchAllProject = async (req, res) => {
  try {
    let filter = {};
    let sort = {};

    // Check if the role is either "Coordinator" or "Admin"
    const teamRole = req.team.role?.name;
    if (teamRole.toLowerCase() !== "coordinator" && teamRole.toLowerCase() !== "admin") {
      const teamId = req.team._id;
      filter.$or = [
        { teamLeader: teamId },
        { responsiblePerson: teamId },
      ];
    };

    // Handle universal searching across all fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { projectName: { $regex: searchRegex } },
        { projectId: { $regex: searchRegex } },
        { startDate: { $regex: searchRegex } },
        { endDate: { $regex: searchRegex } },
        { customer: await findObjectIdByString('Customer', 'name', req.query.search) },
        { projectType: await findObjectIdByString('ProjectType', 'name', req.query.search) },
        { projectCategory: await findObjectIdByString('ProjectCategory', 'name', req.query.search) },
        { projectTiming: await findObjectIdByString('ProjectTiming', 'name', req.query.search) },
        { projectStatus: await findObjectIdByString('ProjectStatus', 'status', req.query.search) },
        { projectPriority: await findObjectIdByString('ProjectPriority', 'name', req.query.search) },
        { responsiblePerson: { $in: await findObjectIdArrayByString('Team', 'name', req.query.search) } },
        { teamLeader: { $in: await findObjectIdArrayByString('Team', 'name', req.query.search) } },
        { technology: { $in: await findObjectIdArrayByString('Technology', 'name', req.query.search) } },
      ];
    };

    // Handle project name search
    if (req.query.projectName) {
      filter.projectName = { $regex: new RegExp(req.query.projectName, 'i') };
    };

    // Handle project name filter
    if (req.query.projectNameFilter) {
      filter.projectName = { $in: Array.isArray(req.query.projectNameFilter) ? req.query.projectNameFilter : [req.query.projectNameFilter] };
    };

    // Handle projectId search
    if (req.query.projectId) {
      filter.projectId = { $regex: new RegExp(req.query.projectId, 'i') };
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

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredProject = project.map((project) => filterFields(project, projection));
    const totalCount = await Project.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All project fetched successfully", project: filteredProject, totalCount });
  } catch (error) {
    console.log("Error while fetching all project:", error.message);
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

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredProject = filterFields(project, projection);

    return res.status(200).json({ success: true, message: "Single project fetched successfully", project: filteredProject });
  } catch (error) {
    console.log("Error while fetching single project:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching single project: ${error.message}` });
  };
};

// Fetch work details based on projectId, current date, or teamId
export const fetchWorkDetail = async (req, res) => {
  try {
    const { projectId, date, teamId } = req.query;
    const match = {};

    if (projectId) {
      match._id = projectId;
    };

    if (date) {
      match["workDetail.date"] = date;
    };

    if (teamId) {
      match["workDetail.teamMember"] = teamId;
    };

    // Aggregate query
    const result = await Project.aggregate([
      { $unwind: "$workDetail" },
      { $match: match },
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
          from: "teams", // Collection name for the Team model
          localField: "_id",
          foreignField: "_id",
          as: "teamMemberInfo",
        },
      },
      {
        $project: {
          _id: 0,
          teamMember: { $arrayElemAt: ["$teamMemberInfo", 0] },
          workDetails: 1,
        },
      },
    ]);

    // Send response
    res.status(200).json({
      success: true,
      message: "Work detail fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error while fetching work details:", error.message);
    res.status(500).json({
      success: false,
      message: "Error while fetching work details",
      error: error.message,
    });
  };
};

// Helper function to calculate the difference in hours
const calculateHourDifference = (startTime, endTime) => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const startDate = new Date(0, 0, 0, startHours, startMinutes);
  const endDate = new Date(0, 0, 0, endHours, endMinutes);
  return (endDate - startDate) / (1000 * 60 * 60);
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
    console.log("Error while updating project:", error.message);
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
    console.log("Error while deleting project:", error.message);
    return res.status(500).json({ success: false, message: `Error while deleting project: ${error.message}` });
  };
};
