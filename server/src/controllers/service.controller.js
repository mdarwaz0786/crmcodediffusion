import Service from "../models/service.model.js";

// Create a new service
export const createService = async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  };
};

// Get all services
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    const total = services.length;
    res.status(200).json({ success: true, data: services, totalCount: total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Get a single service by ID
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    };
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Update a service by ID
export const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    };
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  };
};

// Delete a service by ID
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    };
    res.status(200).json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};
