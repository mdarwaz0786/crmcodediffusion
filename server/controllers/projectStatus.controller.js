import ProjectStatus from "../models/projectStatus.model.js";

// Controller for creating a project status
export const createProjectStatus = async (req, res) => {
  try {
    const { status, description } = req.body;

    const projectStatus = new ProjectStatus({ status, description });
    await projectStatus.save();

    return res.status(200).json({ success: true, message: "Project status created successfully", projectStatus });
  } catch (error) {
    console.log("Error while creating project status:", error.message);
    return res.status(500).json({ success: false, message: `Error while creating project status: ${error.message}` });
  };
};

// Helper function to build the projection object based on user permissions
const buildProjection = (permissions) => {
  const projectStatusFields = permissions.projectStatus.fields;
  const projection = {};

  for (const [key, value] of Object.entries(projectStatusFields)) {
    if (value.show) {
      projection[key] = 1;
    } else {
      projection[key] = 0;
    };
  };

  if (projection._id === undefined) {
    projection._id = 1;
  };

  return projection;
};

// Helper function to filter fields based on projection
const filterFields = (projectStatus, projection) => {
  const filteredProjectStatus = {};

  for (const key in projectStatus._doc) {
    if (projection[key]) {
      filteredProjectStatus[key] = projectStatus[key];
    };
  };

  if (projection._id !== undefined && !filteredProjectStatus._id) {
    filteredProjectStatus._id = projectStatus._id;
  };

  return filteredProjectStatus;
};

// Controller for fetching all project status
export const fetchAllProjectStatus = async (req, res) => {
  try {
    let filter = {};
    let sort = {};

    // Handle universal searching across all fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { status: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    };

    // Handle status search
    if (req.query.status) {
      filter.status = { $regex: new RegExp(req.query.status, 'i') };
    };

    // Handle status filter
    if (req.query.statusFilter) {
      filter.status = { $in: Array.isArray(req.query.statusFilter) ? req.query.statusFilter : [req.query.statusFilter] };
    };

    // Handle sorting
    if (req.query.sort === 'Ascending') {
      sort = { createdAt: 1 };
    } else {
      sort = { createdAt: -1 };
    };

    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const projectStatus = await ProjectStatus.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!projectStatus) {
      return res.status(404).json({ success: false, message: "Project status not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredProjectStatus = projectStatus.map((projectStatus) => filterFields(projectStatus, projection));
    const totalCount = await ProjectStatus.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All project status fetched successfully", projectStatus: filteredProjectStatus, totalCount });
  } catch (error) {
    console.log("Error while fetching all project status:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching all project status: ${error.message}` });
  };
};

// Controller for fetching a single project status
export const fetchSingleProjectStatus = async (req, res) => {
  try {
    const projectStatusId = req.params.id;
    const projectStatus = await ProjectStatus.findById(projectStatusId);

    if (!projectStatus) {
      return res.status(404).json({ success: false, message: "Project status not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredProjectStatus = filterFields(projectStatus, projection);

    return res.status(200).json({ success: true, message: "Single project status fetched successfully", projectStatus: filteredProjectStatus });
  } catch (error) {
    console.log("Error while fetching project status:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching single project status: ${error.message}` });
  };
};

// Controller for updating a project status
export const updateProjectStatus = async (req, res) => {
  try {
    const projectStatusId = req.params.id;
    const { status, description } = req.body;

    const projectStatus = await ProjectStatus.findByIdAndUpdate(projectStatusId, { status, description }, { new: true });

    if (!projectStatus) {
      return res.status(404).json({ success: false, message: "Project status not found" });
    };

    return res.status(200).json({ success: true, message: "Project status updated successfully", projectStatus });
  } catch (error) {
    console.log("Error while updating project status:", error.message);
    return res.status(500).json({ success: false, message: `Error while updating project status: ${error.message}` });
  };
};

// Controller for deleting a project status
export const deleteProjectStatus = async (req, res) => {
  try {
    const projectStatusId = req.params.id;
    const projectStatus = await ProjectStatus.findByIdAndDelete(projectStatusId);

    if (!projectStatus) {
      return res.status(400).json({ success: false, message: "Project status not found" });
    };

    return res.status(200).json({ success: true, message: "Project status deleted successfully" });
  } catch (error) {
    console.log("Error while deleting project status:", error.message);
    return res.status(500).json({ success: false, message: `Error while deleting project status: ${error.message}` });
  };
};
