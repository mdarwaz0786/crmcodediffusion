import Project from "../models/project.model.js";
import Company from "../models/company.model.js";
import mongoose from "mongoose";

// Controller for creating a project
export const createProject = async (req, res) => {
  try {
    const company = req.company;

    const comp = await Company.findOne({ _id: company }).select("projectIdPrefix");

    if (!comp) {
      return res.status(404).json({ success: false, message: "Company not found" });
    };

    const lastProject = await Project.findOne({ company: company }).sort({ createdAt: -1 });

    let nextProjectId;

    if (!lastProject || !lastProject?.projectId) {
      nextProjectId = `${comp?.projectIdPrefix}001`;
    } else {
      const lastNumber = parseInt(lastProject.projectId.replace(comp.projectIdPrefix, "")) || 0;
      const nextNumber = lastNumber + 1;
      nextProjectId = `${comp?.projectIdPrefix}${String(nextNumber).padStart(3, "0")}`;
    };

    const project = new Project({
      ...req.body,
      projectId: nextProjectId,
      company: company
    });

    await project.save();

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error while creating project: ${error.message}`
    });
  };
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
    let filter = { company: req.company };
    let sort = {};

    // Check if the role is not "Coordinator" or "Admin"
    const teamRole = req.team?.role?.name?.toLowerCase();
    const teamId = req.team?._id;
    if (teamRole !== "company" && teamId) {
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
      .populate({ path: "customer", select: "-password" })
      .populate({ path: "projectType", select: "name" })
      .populate({ path: "projectCategory", select: "name" })
      .populate({ path: "projectTiming", select: "name" })
      .populate({ path: "projectPriority", select: "name" })
      .populate({ path: "projectStatus", select: "status" })
      .populate({ path: "responsiblePerson", select: "name" })
      .populate({ path: "teamLeader", select: "name" })
      .populate({ path: "technology", select: "name" })
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

    const project = await Project.findOne({ _id: projectId, company: req.company })
      .populate({ path: "customer", select: "-password" })
      .populate({ path: "projectType", select: "name" })
      .populate({ path: "projectCategory", select: "name" })
      .populate({ path: "projectTiming", select: "name" })
      .populate({ path: "projectPriority", select: "name" })
      .populate({ path: "projectStatus", select: "status" })
      .populate({ path: "responsiblePerson", select: "name" })
      .populate({ path: "teamLeader", select: "name" })
      .populate({ path: "technology", select: "name" })
      .exec();

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    };

    return res.status(200).json({ success: true, message: "Single project fetched successfully", project });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching single project: ${error.message}` });
  };
};

// Controller for updating a project with work detail and payment 
export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const company = req.company;

    const project = await Project.findOne({ _id: projectId, company });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    };

    const updatedProject = await Project
      .findOneAndUpdate(
        { _id: projectId, company },
        req.body,
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
    const project = await Project.findOneAndDelete({ _id: projectId, company: req.company });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    };

    return res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while deleting project: ${error.message}` });
  };
};
