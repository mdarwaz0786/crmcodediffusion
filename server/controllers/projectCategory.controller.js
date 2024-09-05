import ProjectCategory from "../models/projectCategory.model.js";

// Controller for creating a project category
export const createProjectCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const projectCategory = new ProjectCategory({ name, description });
    await projectCategory.save();

    return res.status(200).json({ success: true, message: "Project category created successfully", projectCategory });
  } catch (error) {
    console.log("Error while creating project category:", error.message);
    return res.status(500).json({ success: false, message: `Error while creating project category: ${error.message}` });
  };
};

// Helper function to build the projection object based on user permissions
const buildProjection = (permissions) => {
  const projectCategoryFields = permissions.projectCategory.fields;
  const projection = {};

  for (const [key, value] of Object.entries(projectCategoryFields)) {
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
const filterFields = (projectCategory, projection) => {
  const filteredProjectStatus = {};

  for (const key in projectCategory._doc) {
    if (projection[key]) {
      filteredProjectStatus[key] = projectCategory[key];
    };
  };

  if (projection._id !== undefined && !filteredProjectStatus._id) {
    filteredProjectStatus._id = projectCategory._id;
  };

  return filteredProjectStatus;
};

// Controller for fetching all project category
export const fetchAllProjectCategory = async (req, res) => {
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

    const projectCategory = await ProjectCategory.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!projectCategory) {
      return res.status(404).json({ success: false, message: "Project category not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredProjectCategory = projectCategory.map((projectCategory) => filterFields(projectCategory, projection));
    const totalCount = await ProjectCategory.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All project category fetched successfully", projectCategory: filteredProjectCategory, totalCount });
  } catch (error) {
    console.log("Error while fetching all project category:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching all project category: ${error.message}` });
  };
};

// Controller for fetching a single project category
export const fetchSingleProjectCategory = async (req, res) => {
  try {
    const projectCategoryId = req.params.id;
    const projectCategory = await ProjectCategory.findById(projectCategoryId);

    if (!projectCategory) {
      return res.status(404).json({ success: false, message: "Project category not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredProjectCategory = filterFields(projectCategory, projection);

    return res.status(200).json({ success: true, message: "Singele project category fetched successfully", projectCategory: filteredProjectCategory });
  } catch (error) {
    console.log("Error while fetching single project category:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching single project category: ${error.message}` });
  };
};

// Controller for updating a project category
export const updateProjectCategory = async (req, res) => {
  try {
    const projectCategoryId = req.params.id;
    const { name, description } = req.body;

    const projectCategory = await ProjectCategory.findByIdAndUpdate(projectCategoryId, { name, description }, { new: true });

    if (!projectCategory) {
      return res.status(404).json({ success: false, message: "Project category not found" });
    };

    return res.status(200).json({ success: true, message: "Project category updated successfully", projectCategory });
  } catch (error) {
    console.log("Error while updating project category:", error.message);
    return res.status(500).json({ success: false, message: `Error while updating project category: ${error.message}` });
  };
};

// Controller for deleting a project category
export const deleteProjectCategory = async (req, res) => {
  try {
    const projectCategoryId = req.params.id;
    const projectCategory = await ProjectCategory.findByIdAndDelete(projectCategoryId);

    if (!projectCategory) {
      return res.status(400).json({ success: false, message: "Project category not found" });
    };

    return res.status(200).json({ success: true, message: "Project category deleted successfully" });
  } catch (error) {
    console.log("Error while deleting project category:", error.message);
    return res.status(500).json({ success: false, message: `Error while deleting project category: ${error.message}` });
  };
};
