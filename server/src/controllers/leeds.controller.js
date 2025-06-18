import Leed from "../models/leeds.model.js";

// Create a new lead
export const createLeed = async (req, res) => {
  try {
    const leed = new Leed(req.body);
    await leed.save();
    return res.status(201).json({ success: true, data: leed });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server Error" });
  };
};

// Get all leads
export const getAllLeeds = async (req, res) => {
  try {
    let filter = {};
    let sort = {};

    // Handle searching across all fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { fname: { $regex: searchRegex } },
        { lname: { $regex: searchRegex } },
        { mobile: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { message: { $regex: searchRegex } },
      ];
    };

    // Handle name search
    if (req.query.name) {
      filter.fname = { $regex: new RegExp(req.query.name, 'i') };
    };

    // Handle name filter
    if (req.query.nameFilter) {
      filter.fname = { $in: Array.isArray(req.query.nameFilter) ? req.query.nameFilter : [req.query.nameFilter] };
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

    const leeds = await Leed
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!leeds) {
      return res.status(404).json({ success: false, message: "Leeds not found" });
    };

    const totalCount = await Leed.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All leeds fetched successfully", data: leeds, totalCount });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server Error" });
  };
};

// Get a single lead
export const getLeedById = async (req, res) => {
  try {
    const leed = await Leed.findById(req.params.id);

    if (!leed) {
      return res.status(404).json({ success: false, error: "Leed not found" });
    };

    return res.status(200).json({ success: true, data: leed });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server Error" });
  };
};

// Update a lead
export const updateLeed = async (req, res) => {
  try {
    const leed = await Leed.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!leed) {
      return res.status(404).json({ success: false, error: "Leed not found" });
    };

    return res.status(200).json({ success: true, data: leed });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server Error" });
  };
};

// Delete a lead
export const deleteLeed = async (req, res) => {
  try {
    const leed = await Leed.findByIdAndDelete(req.params.id);

    if (!leed) {
      return res.status(404).json({ success: false, error: "Leed not found" });
    };

    return res.status(200).json({ success: true, message: "Leed deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server Error" });
  };
};
