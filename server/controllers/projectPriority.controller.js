import ProjectPriority from "../models/projectPriority.model.js";

// Controller for creating a project priority
export const createProjectPriority = async (req, res) => {
  try {
    const { name, description } = req.body;

    const projectPriority = new ProjectPriority({ name, description });
    await projectPriority.save();

    return res.status(200).json({ success: true, message: "Project priority created successfully", projectPriority });
  } catch (error) {
    console.log("Error while creating project priority:", error.message);
    return res.status(500).json({ success: false, message: `Error while creating project priority: ${error.message}` });
  };
};

// Helper function to build the projection object based on user permissions
const buildProjection = (permissions) => {
  const projectPriorityFields = permissions.projectPriority.fields;
  const projection = {};

  for (const [key, value] of Object.entries(projectPriorityFields)) {
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
const filterFields = (projectPriority, projection) => {
  const filteredProjectPriority = {};

  for (const key in projectPriority._doc) {
    if (projection[key]) {
      filteredProjectPriority[key] = projectPriority[key];
    };
  };

  if (projection._id !== undefined && !filteredProjectPriority._id) {
    filteredProjectPriority._id = projectPriority._id;
  };

  return filteredProjectPriority;
};

// Controller for fetching all project priority
export const fetchAllProjectPriority = async (req, res) => {
  try {
    let filter = {};
    let sort = {};

    // Handle universal searching across all fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    };

    // Handle name search
    if (req.query.name) {
      filter.name = { $regex: new RegExp(req.query.name, 'i') };
    };

    // Handle name filter
    if (req.query.nameFilter) {
      filter.name = { $in: Array.isArray(req.query.nameFilter) ? req.query.nameFilter : [req.query.nameFilter] };
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

    const projectPriority = await ProjectPriority.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!projectPriority) {
      return res.status(404).json({ success: false, message: "Project priority not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredProjectPriority = projectPriority.map((projectPriority) => filterFields(projectPriority, projection));
    const totalCount = await ProjectPriority.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All project priority fetched successfully", projectPriority: filteredProjectPriority, totalCount });
  } catch (error) {
    console.log("Error while fetching all project priority:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching all project priority: ${error.message}` });
  };
};

// Controller for fetching a single project priority
export const fetchSingleProjectPriority = async (req, res) => {
  try {
    const projectPriorityId = req.params.id;
    const projectPriority = await ProjectPriority.findById(projectPriorityId);

    if (!projectPriority) {
      return res.status(404).json({ success: false, message: "Project priority not found" });
    };
    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredProjectPriority = filterFields(projectPriority, projection);

    return res.status(200).json({ success: true, message: "Single project priority fetched successfully", projectPriority: filteredProjectPriority });
  } catch (error) {
    console.log("Error while fetching single project priority:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching single project priority: ${error.message}` });
  };
};

// Controller for updating a project priority
export const updateProjectPriority = async (req, res) => {
  try {
    const projectPriorityId = req.params.id;
    const { name, description } = req.body;

    const projectPriority = await ProjectPriority.findByIdAndUpdate(projectPriorityId, { name, description }, { new: true });

    if (!projectPriority) {
      return res.status(404).json({ success: false, message: "Project priority not found" });
    };

    return res.status(200).json({ success: true, message: "Project priority updated successfully", projectPriority });
  } catch (error) {
    console.log("Error while updating project priority:", error.message);
    return res.status(500).json({ success: false, message: `Error while updating project priority: ${error.message}` });
  };
};

// Controller for deleting a project priority
export const deleteProjectPriority = async (req, res) => {
  try {
    const projectPriorityId = req.params.id;
    const projectPriority = await ProjectPriority.findByIdAndDelete(projectPriorityId);

    if (!projectPriority) {
      return res.status(400).json({ success: false, message: "Project priority not found" });
    };

    return res.status(200).json({ success: true, message: "Project priority deleted successfully" });
  } catch (error) {
    console.log("Error while deleting project priority:", error.message);
    return res.status(500).json({ success: false, message: `Error while deleting project priority: ${error.message}` });
  };
};
