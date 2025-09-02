import ProjectCategory from "../models/projectCategory.model.js";

// Controller for creating a project category
export const createProjectCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const company = req.company;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required." });
    };

    const projectCategory = new ProjectCategory({ name, description, company });
    await projectCategory.save();

    return res.status(200).json({ success: true, message: "Project category created successfully", projectCategory });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while creating project category: ${error.message}` });
  };
};

// Controller for fetching all project category
export const fetchAllProjectCategory = async (req, res) => {
  try {
    let filter = { company: req.company };
    let sort = {};

    // Handle searching across all fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    };

    // Handle name search
    if (req.query.name) {
      filter.name = { $regex: new RegExp(req.query.name.trim(), 'i') };
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
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const projectCategory = await ProjectCategory
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!projectCategory) {
      return res.status(404).json({ success: false, message: "Project category not found" });
    };

    const totalCount = await ProjectCategory.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All project category fetched successfully", projectCategory, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching all project category: ${error.message}` });
  };
};

// Controller for fetching a single project category
export const fetchSingleProjectCategory = async (req, res) => {
  try {
    const projectCategoryId = req.params.id;

    const projectCategory = await ProjectCategory
      .findOne({ _id: projectCategoryId, company: req.company });

    if (!projectCategory) {
      return res.status(404).json({ success: false, message: "Project category not found" });
    };

    return res.status(200).json({ success: true, message: "Singele project category fetched successfully", projectCategory });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching single project category: ${error.message}` });
  };
};

// Controller for updating a project category
export const updateProjectCategory = async (req, res) => {
  try {
    const projectCategoryId = req.params.id;

    const { name, description } = req.body;

    const projectCategory = await ProjectCategory
      .findOneAndUpdate({ _id: projectCategoryId, company: req.company }, { name, description }, { new: true, runValidators: true });

    if (!projectCategory) {
      return res.status(404).json({ success: false, message: "Project category not found" });
    };

    return res.status(200).json({ success: true, message: "Project category updated successfully", projectCategory });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while updating project category: ${error.message}` });
  };
};

// Controller for deleting a project category
export const deleteProjectCategory = async (req, res) => {
  try {
    const projectCategoryId = req.params.id;

    const projectCategory = await ProjectCategory
      .findOneAndDelete({ _id: projectCategoryId, company: req.company });

    if (!projectCategory) {
      return res.status(400).json({ success: false, message: "Project category not found" });
    };

    return res.status(200).json({ success: true, message: "Project category deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while deleting project category: ${error.message}` });
  };
};
