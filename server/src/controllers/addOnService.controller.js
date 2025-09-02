import AddOnService from "../models/addOnService.model.js";
import mongoose from "mongoose";

// Create a new Add On Service
export const createAddOnService = async (req, res) => {
  try {
    const addOnService = new AddOnService({ ...req.body, company: req.company });

    await addOnService.save();

    return res.status(201).json({ success: true, data: addOnService });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  };
};

// Helper function to find ObjectId by string in referenced models
const findObjectIdByString = async (modelName, fieldName, searchString) => {
  const Model = mongoose.model(modelName);
  const result = await Model.findOne({ [fieldName]: { $regex: new RegExp(searchString, 'i') } }).select('_id');
  return result ? result._id : null;
};

// Get all Add On Services
export const getAllAddOnServices = async (req, res) => {
  try {
    let filter = { company: req.company };
    let sort = {};

    // Handle searching across all fields
    if (req.query.search) {
      filter.$or = [
        { projectName: await findObjectIdByString('Project', 'projectName', req.query.search.trim()) },
        { clientName: await findObjectIdByString('Customer', 'name', req.query.search.trim()) },
        { serviceName: await findObjectIdByString('Service', 'name', req.query.search.trim()) },
      ];
    };

    // Handle service name filter
    if (req.query.nameFilter) {
      filter.serviceName = { $in: Array.isArray(req.query.nameFilter) ? req.query.nameFilter : [req.query.nameFilter] };
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

    const addOnServices = await AddOnService
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("clientName projectName serviceName")
      .exec();

    if (!addOnServices) {
      return res.status(404).json({ success: false, message: "Add on services not found" });
    };

    const totalCount = await AddOnService.countDocuments(filter);

    return res.status(200).json({ success: true, data: addOnServices, total: totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get a single Add On Service by ID
export const getAddOnServiceById = async (req, res) => {
  try {
    const addOnService = await AddOnService
      .findOne({ _id: req.params.id, company: req.company })
      .populate("clientName projectName serviceName")
      .exec();

    if (!addOnService) {
      return res.status(404).json({ success: false, message: "Add on service not found" });
    };

    return res.status(200).json({ success: true, data: addOnService });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get Add On Service by projectId
export const getAddOnServiceByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;

    const addOnService = await AddOnService
      .findOne({ projectName: projectId, company: req.company })
      .populate("clientName projectName serviceName")
      .exec();

    if (!addOnService) {
      return res.status(404).json({ success: false, message: "No add on service for this project" });
    };

    return res.status(200).json({ success: true, data: addOnService });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Update an Add On Service by ID
export const updateAddOnService = async (req, res) => {
  try {
    const addOnService = await AddOnService
      .findOneAndUpdate({ _id: req.params.id, company: req.company }, req.body, { new: true, runValidators: true });

    if (!addOnService) {
      return res.status(404).json({ success: false, message: "Add on service not found" });
    };

    return res.status(200).json({ success: true, data: addOnService });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  };
};

// Delete an Add On Service by ID
export const deleteAddOnService = async (req, res) => {
  try {
    const addOnService = await AddOnService.findOneAndDelete({ _id: req.params.id, company: req.company });

    if (!addOnService) {
      return res.status(404).json({ success: false, message: "Add on service not found" });
    };

    return res.status(200).json({ success: true, message: "Add on service deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};