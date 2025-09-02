import ProjectType from "../models/projectType.model.js";

// Controller for creating a project type
export const createProjectType = async (req, res) => {
  try {
    const { name, description } = req.body;
    const company = req.company;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required." });
    };

    const projectType = new ProjectType({ name, description, company });
    await projectType.save();

    return res.status(200).json({ success: true, message: "Project type created successfully", projectType });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while creating project type: ${error.message}` });
  };
};

// Controller for fetching all project type
export const fetchAllProjectType = async (req, res) => {
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

    const projectType = await ProjectType
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!projectType) {
      return res.status(404).json({ success: false, message: "Project type not found" });
    };

    const totalCount = await ProjectType.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All project type fetched successfully", projectType, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching all project type: ${error.message}` });
  };
};

// Controller for fetching a single project type
export const fetchSingleProjectType = async (req, res) => {
  try {
    const projectTypeId = req.params.id;

    const projectType = await ProjectType
      .findOne({ _id: projectTypeId, company: req.company });

    if (!projectType) {
      return res.status(404).json({ success: false, message: "Project type not found" });
    };

    return res.status(200).json({ success: true, message: "Single project type fetched successfully", projectType });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching single project type: ${error.message}` });
  };
};

// Controller for updating a project type
export const updateProjectType = async (req, res) => {
  try {
    const projectTypeId = req.params.id;

    const { name, description } = req.body;

    const projectType = await ProjectType
      .findOneAndUpdate({ _id: projectTypeId, company: req.company }, { name, description }, { new: true, runValidators: true });

    if (!projectType) {
      return res.status(404).json({ success: false, message: "Project type not found" });
    };

    return res.status(200).json({ success: true, message: "Project type updated successfully", projectType });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while updating project type: ${error.message}` });
  };
};

// Controller for deleting a project type
export const deleteProjectType = async (req, res) => {
  try {
    const projectTypeId = req.params.id;

    const projectType = await ProjectType
      .findOneAndDelete({ _id: projectTypeId, company: req.company });

    if (!projectType) {
      return res.status(400).json({ success: false, message: "Project type not found" });
    };

    return res.status(200).json({ success: true, message: "Project type deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while deleting project type: ${error.message}` });
  };
};
