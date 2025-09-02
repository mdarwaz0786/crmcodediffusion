import ProjectStatus from "../models/projectStatus.model.js";

// Controller for creating a project status
export const createProjectStatus = async (req, res) => {
  try {
    const { status, description } = req.body;
    const company = req.company;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required." });
    };

    const projectStatus = new ProjectStatus({ status, description, company });
    await projectStatus.save();

    return res.status(200).json({ success: true, message: "Project status created successfully", projectStatus });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while creating project status: ${error.message}` });
  };
};

// Controller for fetching all project status
export const fetchAllProjectStatus = async (req, res) => {
  try {
    let filter = { company: req.company };
    let sort = {};

    // Handle searching across all fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { status: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    };

    // Handle status search
    if (req.query.status) {
      filter.status = { $regex: new RegExp(req.query.status.trim(), 'i') };
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
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const projectStatus = await ProjectStatus
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!projectStatus) {
      return res.status(404).json({ success: false, message: "Project status not found" });
    };

    const totalCount = await ProjectStatus.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All project status fetched successfully", projectStatus, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching all project status: ${error.message}` });
  };
};

// Controller for fetching a single project status
export const fetchSingleProjectStatus = async (req, res) => {
  try {
    const projectStatusId = req.params.id;

    const projectStatus = await ProjectStatus
      .findOne({ _id: projectStatusId, company: req.company });

    if (!projectStatus) {
      return res.status(404).json({ success: false, message: "Project status not found" });
    };

    return res.status(200).json({ success: true, message: "Single project status fetched successfully", projectStatus });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching single project status: ${error.message}` });
  };
};

// Controller for updating a project status
export const updateProjectStatus = async (req, res) => {
  try {
    const projectStatusId = req.params.id;

    const { status, description } = req.body;

    const projectStatus = await ProjectStatus
      .findOneAndUpdate({ _id: projectStatusId, company: req.company }, { status, description }, { new: true, runValidators: true });

    if (!projectStatus) {
      return res.status(404).json({ success: false, message: "Project status not found" });
    };

    return res.status(200).json({ success: true, message: "Project status updated successfully", projectStatus });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while updating project status: ${error.message}` });
  };
};

// Controller for deleting a project status
export const deleteProjectStatus = async (req, res) => {
  try {
    const projectStatusId = req.params.id;

    const projectStatus = await ProjectStatus.findOneAndDelete({ _id: projectStatusId, company: req.company });

    if (!projectStatus) {
      return res.status(400).json({ success: false, message: "Project status not found" });
    };

    return res.status(200).json({ success: true, message: "Project status deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while deleting project status: ${error.message}` });
  };
};
