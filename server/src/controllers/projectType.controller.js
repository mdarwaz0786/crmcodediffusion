import ProjectType from "../models/projectType.model.js";

// Controller for creating a project type
export const createProjectType = async (req, res) => {
  try {
    const { name, description } = req.body;

    const projectType = new ProjectType({ name, description });
    await projectType.save();

    return res.status(200).json({ success: true, message: "Project type created successfully", projectType });
  } catch (error) {
    console.log("Error while creating project type:", error.message);
    return res.status(500).json({ success: false, message: `Error while creating project type: ${error.message}` });
  };
};

// Helper function to build the projection object based on user permissions
const buildProjection = (permissions) => {
  const projectTypeFields = permissions.projectType.fields;
  const projection = {};

  for (const [key, value] of Object.entries(projectTypeFields)) {
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
const filterFields = (projectType, projection) => {
  const filteredProjectType = {};

  for (const key in projectType._doc) {
    if (projection[key]) {
      filteredProjectType[key] = projectType[key];
    };
  };

  if (projection._id !== undefined && !filteredProjectType._id) {
    filteredProjectType._id = projectType._id;
  };

  return filteredProjectType;
};

// Controller for fetching all project type
export const fetchAllProjectType = async (req, res) => {
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

    const projectType = await ProjectType.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!projectType) {
      return res.status(404).json({ success: false, message: "Project type not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredProjectType = projectType.map((projectType) => filterFields(projectType, projection));
    const totalCount = await ProjectType.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All project type fetched successfully", projectType: filteredProjectType, totalCount });
  } catch (error) {
    console.log("Error while fetching all project type:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching all project type: ${error.message}` });
  };
};

// Controller for fetching a single project type
export const fetchSingleProjectType = async (req, res) => {
  try {
    const projectTypeId = req.params.id;
    const projectType = await ProjectType.findById(projectTypeId);

    if (!projectType) {
      return res.status(404).json({ success: false, message: "Project type not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredProjectType = filterFields(projectType, projection);

    return res.status(200).json({ success: true, message: "Single project type fetched successfully", projectType: filteredProjectType });
  } catch (error) {
    console.log("Error while fetching single project type:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching single project type: ${error.message}` });
  };
};

// Controller for updating a project type
export const updateProjectType = async (req, res) => {
  try {
    const projectTypeId = req.params.id;
    const { name, description } = req.body;

    const projectType = await ProjectType.findByIdAndUpdate(projectTypeId, { name, description }, { new: true });

    if (!projectType) {
      return res.status(404).json({ success: false, message: "Project type not found" });
    };

    return res.status(200).json({ success: true, message: "Project type updated successfully", projectType });
  } catch (error) {
    console.log("Error while updating project type:", error.message);
    return res.status(500).json({ success: false, message: `Error while updating project type: ${error.message}` });
  };
};

// Controller for deleting a project type
export const deleteProjectType = async (req, res) => {
  try {
    const projectTypeId = req.params.id;
    const projectType = await ProjectType.findByIdAndDelete(projectTypeId);

    if (!projectType) {
      return res.status(400).json({ success: false, message: "Project type not found" });
    };

    return res.status(200).json({ success: true, message: "Project type deleted successfully" });
  } catch (error) {
    console.log("Error while deleting project type:", error.message);
    return res.status(500).json({ success: false, message: `Error while deleting project type: ${error.message}` });
  };
};
