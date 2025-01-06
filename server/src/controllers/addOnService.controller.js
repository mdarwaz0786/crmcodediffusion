import AddOnService from "../models/addOnService.model.js";

// Create a new AddOnService
export const createAddOnService = async (req, res) => {
  try {
    const addOnService = new AddOnService(req.body);
    await addOnService.save();
    res.status(201).json({ success: true, data: addOnService });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  };
};

// Get all AddOnServices
export const getAllAddOnServices = async (req, res) => {
  try {
    const addOnServices = await AddOnService.find().populate("clientName projectName serviceName");
    if (!addOnServices) {
      return res.status(404).json({ success: false, message: "Add on services not found" });
    };
    const total = addOnServices.length;
    res.status(200).json({ success: true, data: addOnServices, totalCount: total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Get a single AddOnService by ID
export const getAddOnServiceById = async (req, res) => {
  try {
    const addOnService = await AddOnService.findById(req.params.id).populate("clientName projectName serviceName");
    if (!addOnService) {
      return res.status(404).json({ success: false, message: "Add on service not found" });
    };
    res.status(200).json({ success: true, data: addOnService });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Update an AddOnService by ID
export const updateAddOnService = async (req, res) => {
  try {
    const addOnService = await AddOnService.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!addOnService) {
      return res.status(404).json({ success: false, message: "Add on service not found" });
    };
    res.status(200).json({ success: true, data: addOnService });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  };
};

// Delete an AddOnService by ID
export const deleteAddOnService = async (req, res) => {
  try {
    const addOnService = await AddOnService.findByIdAndDelete(req.params.id);
    if (!addOnService) {
      return res.status(404).json({ success: false, message: "Add on service not found" });
    };
    res.status(200).json({ success: true, message: "Add on service deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};
