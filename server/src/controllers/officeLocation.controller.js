import OfficeLocation from "../models/officeLocation.model.js";

// Create a new office location
export const createOfficeLocation = async (req, res) => {
  try {
    const {
      name,
      email,
      contact,
      latitude,
      longitude,
      addressLine1,
      addressLine2,
      addressLine3,
    } = req.body;

    // Check if required fields are present
    if (
      !name ||
      !email ||
      !contact ||
      !latitude ||
      !longitude ||
      !addressLine1
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    };

    // Get the logo file from the request
    let logo = "";

    if (req.file) {
      const file = req.file;
      logo = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    };

    const officeLocation = new OfficeLocation({
      name,
      email,
      contact,
      latitude,
      longitude,
      addressLine1,
      addressLine2,
      addressLine3,
      logo,
    });

    await officeLocation.save();

    res.status(201).json({
      success: true,
      officeLocation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  };
};

// Get all office locations
export const fetchAllOfficeLocation = async (req, res) => {
  try {
    const officeLocation = await OfficeLocation.find();

    if (!officeLocation) {
      return res.status(404).json({ success: false, message: "Office location not found." });
    };

    res.status(200).json({ success: true, officeLocation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  };
};

// Get a single office location
export const fetchSingleOfficeLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const officeLocation = await OfficeLocation.findById(id);

    if (!officeLocation) {
      return res.status(404).json({ success: false, message: "Office location not found." });
    };

    res.status(200).json({ success: true, officeLocation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  };
};

// Update an office location
export const updateOfficeLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      contact,
      latitude,
      longitude,
      addressLine1,
      addressLine2,
      addressLine3,
    } = req.body;

    let updateData = {
      name,
      email,
      contact,
      latitude,
      longitude,
      addressLine1,
      addressLine2,
      addressLine3,
    };

    // Check if a logo file is provided and update it as base64
    if (req.file) {
      const file = req.file;
      updateData.logo = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    };

    const officeLocation = await OfficeLocation.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!officeLocation) {
      return res.status(404).json({
        success: false,
        message: "Office location not found.",
      });
    };

    res.status(200).json({
      success: true,
      officeLocation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  };
};

// Delete an office location
export const deleteOfficeLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const officeLocation = await OfficeLocation.findByIdAndDelete(id);

    if (!officeLocation) {
      return res.status(404).json({ success: false, message: "Office location not found." });
    };

    res.status(200).json({ success: true, message: "Office location deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  };
};
