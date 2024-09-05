import Designation from "../models/designation.model.js";

// Controller for creating a designation
export const createDesignation = async (req, res) => {
  try {
    const { name, description } = req.body;

    const designation = new Designation({ name, description });
    await designation.save();

    return res.status(200).json({ success: true, message: "Designation created successfully", designation });
  } catch (error) {
    console.log("Error while creating designation:", error.message);
    return res.status(500).json({ success: false, message: `Error while creating designation: ${error.message}` });
  };
};

// Helper function to build the projection object based on user permissions
const buildProjection = (permissions) => {
  const designationFields = permissions.designation.fields;
  const projection = {};

  for (const [key, value] of Object.entries(designationFields)) {
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
const filterFields = (designation, projection) => {
  const filteredDesignation = {};

  for (const key in designation._doc) {
    if (projection[key]) {
      filteredDesignation[key] = designation[key];
    };
  };

  if (projection._id !== undefined && !filteredDesignation._id) {
    filteredDesignation._id = designation._id;
  };

  return filteredDesignation;
};

// Controller for fetching all designation
export const fetchAllDesignation = async (req, res) => {
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

    const designation = await Designation.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!designation) {
      return res.status(404).json({ success: false, message: "Designation not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredDesignation = designation.map((designation) => filterFields(designation, projection));
    const totalCount = await Designation.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All designation fetched successfully", designation: filteredDesignation, totalCount });
  } catch (error) {
    console.log("Error while fetching all designation:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching all designation: ${error.message}` });
  };
};

// Controller for fetching a single designation
export const fetchSingleDesignation = async (req, res) => {
  try {
    const designationId = req.params.id;
    const designation = await Designation.findById(designationId);

    if (!designation) {
      return res.status(404).json({ success: false, message: "Designation not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredDesignation = filterFields(designation, projection);

    return res.status(200).json({ success: true, message: "Single designation fetched successfully", designation: filteredDesignation });
  } catch (error) {
    console.log("Error while fetching single designation:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching single designation: ${error.message}` });
  };
};

// Controller for updating a designation
export const updateDesignation = async (req, res) => {
  try {
    const designationId = req.params.id;
    const { name, description } = req.body;

    const designation = await Designation.findByIdAndUpdate(designationId, { name, description }, { new: true });

    if (!designation) {
      return res.status(404).json({ success: false, message: "Designation not found" });
    };

    return res.status(200).json({ success: true, message: "Designation updated successfully", designation });
  } catch (error) {
    console.log("Error while updating designation:", error.message);
    return res.status(500).json({ success: false, message: `Error while updating designation: ${error.message}` });
  };
};

// Controller for deleting a designation
export const deleteDesignation = async (req, res) => {
  try {
    const designationId = req.params.id;
    const designation = await Designation.findByIdAndDelete(designationId);

    if (!designation) {
      return res.status(400).json({ success: false, message: "Designation not found" });
    };

    return res.status(200).json({ success: true, message: "Designation deleted successfully" });
  } catch (error) {
    console.log("Error while deleting designation:", error.message);
    return res.status(500).json({ success: false, message: `Error while deleting designation: ${error.message}` });
  };
};
