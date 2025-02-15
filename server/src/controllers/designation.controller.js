import Designation from "../models/designation.model.js";

// Controller for creating a designation
export const createDesignation = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required." });
    };

    const designation = new Designation({ name, description });
    await designation.save();

    return res.status(200).json({ success: true, message: "Designation created successfully", designation });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while creating designation: ${error.message}` });
  };
};

// Controller for fetching all designation
export const fetchAllDesignation = async (req, res) => {
  try {
    let filter = {};
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

    const designation = await Designation
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!designation) {
      return res.status(404).json({ success: false, message: "Designation not found" });
    };

    const totalCount = await Designation.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All designation fetched successfully", designation, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching all designation: ${error.message}` });
  };
};

// Controller for fetching a single designation
export const fetchSingleDesignation = async (req, res) => {
  try {
    const designationId = req.params.id;

    const designation = await Designation
      .findById(designationId);

    if (!designation) {
      return res.status(404).json({ success: false, message: "Designation not found" });
    };

    return res.status(200).json({ success: true, message: "Single designation fetched successfully", designation });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching single designation: ${error.message}` });
  };
};

// Controller for updating a designation
export const updateDesignation = async (req, res) => {
  try {
    const designationId = req.params.id;

    const { name, description } = req.body;

    const designation = await Designation
      .findByIdAndUpdate(designationId, { name, description }, { new: true });

    if (!designation) {
      return res.status(404).json({ success: false, message: "Designation not found" });
    };

    return res.status(200).json({ success: true, message: "Designation updated successfully", designation });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while updating designation: ${error.message}` });
  };
};

// Controller for deleting a designation
export const deleteDesignation = async (req, res) => {
  try {
    const designationId = req.params.id;

    const designation = await Designation
      .findByIdAndDelete(designationId);

    if (!designation) {
      return res.status(400).json({ success: false, message: "Designation not found" });
    };

    return res.status(200).json({ success: true, message: "Designation deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while deleting designation: ${error.message}` });
  };
};
