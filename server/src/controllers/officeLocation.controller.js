import OfficeLocation from "../models/officeLocation.model.js";

// Create a new office location
export const createOfficeLocation = async (req, res) => {
  try {
    const {
      uniqueCode,
      name,
      websiteLink,
      email,
      noReplyEmail,
      noReplyEmailAppPassword,
      contact,
      GSTNumber,
      accountNumber,
      accountName,
      accountType,
      bankName,
      IFSCCode,
      latitude,
      longitude,
      attendanceRadius,
      addressLine1,
      addressLine2,
      addressLine3,
    } = req.body;

    const company = req.company;

    // Check if required fields are present
    if (
      !uniqueCode ||
      !name ||
      !websiteLink ||
      !email ||
      !noReplyEmail ||
      !noReplyEmailAppPassword ||
      !contact ||
      !GSTNumber ||
      !accountNumber ||
      !accountName ||
      !accountType ||
      !bankName ||
      !IFSCCode ||
      !latitude ||
      !longitude ||
      !attendanceRadius ||
      !addressLine1 ||
      !addressLine2 ||
      !addressLine3
    ) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    };

    // Get the logo file from the request
    let logo = "";

    if (req.file) {
      const file = req.file;
      logo = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    };

    const officeLocation = new OfficeLocation({
      uniqueCode,
      name,
      websiteLink,
      email,
      noReplyEmail,
      noReplyEmailAppPassword,
      contact,
      GSTNumber,
      accountNumber,
      accountName,
      accountType,
      bankName,
      IFSCCode,
      latitude,
      longitude,
      attendanceRadius,
      addressLine1,
      addressLine2,
      addressLine3,
      logo,
      company,
    });

    await officeLocation.save();

    return res.status(201).json({ success: true, officeLocation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get all office locations
export const fetchAllOfficeLocation = async (req, res) => {
  try {
    let filter = { company: req.company };
    let sort = {};

    // Handle searching across all fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { uniqueCode: { $regex: searchRegex } },
        { addressLine1: { $regex: searchRegex } },
        { addressLine2: { $regex: searchRegex } },
        { addressLine3: { $regex: searchRegex } },
      ];
    };

    // Handle name search
    if (req.query.name) {
      filter.uniqueCode = { $regex: new RegExp(req.query.name.trim(), 'i') };
    };

    // Handle name filter
    if (req.query.nameFilter) {
      filter.uniqueCode = { $in: Array.isArray(req.query.nameFilter) ? req.query.nameFilter : [req.query.nameFilter] };
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

    const officeLocation = await OfficeLocation
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!officeLocation) {
      return res.status(404).json({ success: false, message: "Office location not found." });
    };

    const totalCount = await OfficeLocation.countDocuments(filter);

    return res.status(200).json({ success: true, officeLocation, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get a single office location
export const fetchSingleOfficeLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const officeLocation = await OfficeLocation
      .findOne({ _id: id, company: req.company });

    if (!officeLocation) {
      return res.status(404).json({ success: false, message: "Office location not found." });
    };

    return res.status(200).json({ success: true, officeLocation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Update an office location
export const updateOfficeLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      uniqueCode,
      name,
      websiteLink,
      email,
      noReplyEmail,
      noReplyEmailAppPassword,
      contact,
      GSTNumber,
      accountNumber,
      accountName,
      accountType,
      bankName,
      IFSCCode,
      latitude,
      longitude,
      attendanceRadius,
      addressLine1,
      addressLine2,
      addressLine3,
    } = req.body;

    let updateData = {
      uniqueCode,
      name,
      websiteLink,
      email,
      noReplyEmail,
      noReplyEmailAppPassword,
      contact,
      GSTNumber,
      accountNumber,
      accountName,
      accountType,
      bankName,
      IFSCCode,
      latitude,
      longitude,
      attendanceRadius,
      addressLine1,
      addressLine2,
      addressLine3,
    };

    // Check if a logo file is provided and update it as base64
    if (req.file) {
      const file = req.file;
      updateData.logo = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    };

    const officeLocation = await OfficeLocation.findOneAndUpdate({ _id: id, company: req.company }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!officeLocation) {
      return res.status(404).json({ success: false, message: "Office location not found." });
    };

    return res.status(200).json({ success: true, officeLocation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Delete an office location
export const deleteOfficeLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const officeLocation = await OfficeLocation
      .findOneAndDelete({ _id: id, company: req.company });

    if (!officeLocation) {
      return res.status(404).json({ success: false, message: "Office location not found." });
    };

    return res.status(200).json({ success: true, message: "Office location deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};
