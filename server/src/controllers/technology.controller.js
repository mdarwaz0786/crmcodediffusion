import Technology from "../models/technology.model.js";

// Controller for creating a technology
export const createTechnology = async (req, res) => {
  try {
    const { name, description } = req.body;

    const technology = new Technology({ name, description });
    await technology.save();

    return res.status(200).json({ success: true, message: "Technology created successfully", technology });
  } catch (error) {
    console.log("Error while creating technology:", error.message);
    return res.status(500).json({ success: false, message: "Error while creating technology", error: error.message });
  };
};

// Helper function to build the projection object based on user permissions
const buildProjection = (permissions) => {
  const technologyFields = permissions.technology.fields;
  const projection = {};

  for (const [key, value] of Object.entries(technologyFields)) {
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
const filterFields = (technology, projection) => {
  const filteredTechnology = {};

  for (const key in technology._doc) {
    if (projection[key]) {
      filteredTechnology[key] = technology[key];
    };
  };

  if (projection._id !== undefined && !filteredTechnology._id) {
    filteredTechnology._id = technology._id;
  };

  return filteredTechnology;
};

// Controller for fetching all technology
export const fetchAllTechnology = async (req, res) => {
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

    const technology = await Technology.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!technology) {
      return res.status(404).json({ success: false, message: "Technology not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredTechnology = technology.map((technology) => filterFields(technology, projection));
    const totalCount = await Technology.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All technology fetched successfully", technology: filteredTechnology, totalCount });
  } catch (error) {
    console.log("Error while fetching all technology:", error.message);
    return res.status(500).json({ success: false, message: "Error while fetching all technology", error: error.message });
  };
};

// Controller for fetching a single technology
export const fetchSingleTechnology = async (req, res) => {
  try {
    const technologyId = req.params.id;
    const technology = await Technology.findById(technologyId);

    if (!technology) {
      return res.status(404).json({ success: false, message: "Technology not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredTechnology = filterFields(technology, projection);

    return res.status(200).json({ success: true, message: "Single technology fetched successfully", technology: filteredTechnology });
  } catch (error) {
    console.log("Error while fetching single technology:", error.message);
    return res.status(500).json({ success: false, message: "Error while fetching single technology", error: error.message });
  };
};

// Controller for updating a technology
export const updateTechnology = async (req, res) => {
  try {
    const technologyId = req.params.id;
    const { name, description } = req.body;

    const technology = await Technology.findByIdAndUpdate(technologyId, { name, description }, { new: true });

    if (!technology) {
      return res.status(404).json({ success: false, message: "Technology not found" });
    };

    return res.status(200).json({ success: true, message: "Technology updated successfully", technology });
  } catch (error) {
    console.log("Error while updating technology:", error.message);
    return res.status(500).json({ success: false, message: "Error while updating technology", error: error.message });
  };
};

// Controller for deleting a technology
export const deleteTechnology = async (req, res) => {
  try {
    const technologyId = req.params.id;
    const technology = await Technology.findByIdAndDelete(technologyId);

    if (!technology) {
      return res.status(400).json({ success: false, message: "Technology not found" });
    };

    return res.status(200).json({ success: true, message: "Technology deleted successfully" });
  } catch (error) {
    console.log("Error while deleting technology:", error.message);
    return res.status(500).json({ success: false, message: "Error while deleting technology", error: error.message });
  };
};
