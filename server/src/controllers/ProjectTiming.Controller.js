import ProjectTiming from "../models/projectTiming.model.js";

// Controller for creating a project timeline
export const createProjectTiming = async (req, res) => {
  try {
    const { name, description } = req.body;
    const company = req.company;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required." });
    };

    const projectTiming = new ProjectTiming({ name, description, company });
    await projectTiming.save();

    return res.status(200).json({ success: true, message: "Project timeline created successfully", projectTiming });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while creating project timeline: ${error.message}` });
  };
};

// Controller for fetching all project timeline
export const fetchAllProjectTiming = async (req, res) => {
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
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const projectTiming = await ProjectTiming
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!projectTiming) {
      return res.status(404).json({ success: false, message: "Project timeline not found" });
    };

    const totalCount = await ProjectTiming.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All project timeline fetched successfully", projectTiming, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching all project timeline: ${error.message}` });
  };
};

// Controller for fetching a single project timeline
export const fetchSingleProjectTiming = async (req, res) => {
  try {
    const projectTimingId = req.params.id;

    const projectTiming = await ProjectTiming
      .findOne({ _id: projectTimingId, company: req.company });

    if (!projectTiming) {
      return res.status(404).json({ success: false, message: "Project timeline not found" });
    };

    return res.status(200).json({ success: true, message: "Single project timeline fetched successfully", projectTiming });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching single project timeline: ${error.message}` });
  };
};

// Controller for updating a project timeline
export const updateProjectTiming = async (req, res) => {
  try {
    const projectTimingId = req.params.id;

    const { name, description } = req.body;

    const projectTiming = await ProjectTiming
      .findOneAndUpdate({ _id: projectTimingId, company: req.company }, { name, description }, { new: true, runValidators: true });

    if (!projectTiming) {
      return res.status(404).json({ success: false, message: "Project timeline not found" });
    };

    return res.status(200).json({ success: true, message: "Project timeline updated successfully", projectTiming });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while updating project timeline: ${error.message}` });
  };
};

// Controller for deleting a project timeline
export const deleteProjectTiming = async (req, res) => {
  try {
    const projectTimingId = req.params.id;

    const projectTiming = await ProjectTiming
      .findOneAndDelete({ _id: projectTimingId, company: req.company });

    if (!projectTiming) {
      return res.status(400).json({ success: false, message: "Project timeline not found" });
    };

    return res.status(200).json({ success: true, message: "Project timeline deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while deleting project timeline: ${error.message}` });
  };
};
