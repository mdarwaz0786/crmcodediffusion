import ProjectPriority from "../models/projectPriority.model.js";

// Controller for creating a project priority
export const createProjectPriority = async (req, res) => {
  try {
    const { name, description } = req.body;
    const company = req.company;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required." });
    };

    const projectPriority = new ProjectPriority({ name, description, company });
    await projectPriority.save();

    return res.status(200).json({ success: true, message: "Project priority created successfully", projectPriority });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while creating project priority: ${error.message}` });
  };
};

// Controller for fetching all project priority
export const fetchAllProjectPriority = async (req, res) => {
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

    const projectPriority = await ProjectPriority
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!projectPriority) {
      return res.status(404).json({ success: false, message: "Project priority not found" });
    };

    const totalCount = await ProjectPriority.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All project priority fetched successfully", projectPriority, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching all project priority: ${error.message}` });
  };
};

// Controller for fetching a single project priority
export const fetchSingleProjectPriority = async (req, res) => {
  try {
    const projectPriorityId = req.params.id;

    const projectPriority = await ProjectPriority
      .findOne({ _id: projectPriorityId, company: req.company });

    if (!projectPriority) {
      return res.status(404).json({ success: false, message: "Project priority not found" });
    };

    return res.status(200).json({ success: true, message: "Single project priority fetched successfully", projectPriority });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching single project priority: ${error.message}` });
  };
};

// Controller for updating a project priority
export const updateProjectPriority = async (req, res) => {
  try {
    const projectPriorityId = req.params.id;

    const { name, description } = req.body;

    const projectPriority = await ProjectPriority
      .findOneAndUpdate({ _id: projectPriorityId, company: req.company }, { name, description }, { new: true, run: true });

    if (!projectPriority) {
      return res.status(404).json({ success: false, message: "Project priority not found" });
    };

    return res.status(200).json({ success: true, message: "Project priority updated successfully", projectPriority });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while updating project priority: ${error.message}` });
  };
};

// Controller for deleting a project priority
export const deleteProjectPriority = async (req, res) => {
  try {
    const projectPriorityId = req.params.id;

    const projectPriority = await ProjectPriority.findOneAndDelete({ _id: projectPriorityId, company: req.company });

    if (!projectPriority) {
      return res.status(400).json({ success: false, message: "Project priority not found" });
    };

    return res.status(200).json({ success: true, message: "Project priority deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while deleting project priority: ${error.message}` });
  };
};
