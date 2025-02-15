import Service from "../models/service.model.js";

// Create a new service
export const createService = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required." });
    };

    const service = new Service({ name, permissions });
    await service.save();

    return res.status(201).json({ success: true, data: service });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  };
};

// Get all services
export const getAllServices = async (req, res) => {
  try {
    let filter = {};
    let sort = {};

    // Handle searching across all fields
    if (req.query.search) {
      filter.name = { $regex: new RegExp(req.query.search.trim(), 'i') };
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

    const services = await Service
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!services) {
      return res.status(404).json({ success: false, message: "Services not found" });
    };

    const totalCount = await Service.countDocuments(filter);

    return res.status(200).json({ success: true, data: services, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get a single service by ID
export const getServiceById = async (req, res) => {
  try {
    const service = await Service
      .findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    };

    return res.status(200).json({ success: true, data: service });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Update a service by ID
export const updateService = async (req, res) => {
  try {
    const service = await Service
      .findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    };

    return res.status(200).json({ success: true, data: service });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  };
};

// Delete a service by ID
export const deleteService = async (req, res) => {
  try {
    const service = await Service
      .findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    };

    return res.status(200).json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};
