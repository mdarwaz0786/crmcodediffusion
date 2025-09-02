import Technology from "../models/technology.model.js";

// Controller for creating a technology
export const createTechnology = async (req, res) => {
  try {
    const { name, description } = req.body;
    const company = req.company;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required." });
    };

    const technology = new Technology({ name, description, company });
    await technology.save();

    return res.status(200).json({ success: true, message: "Technology created successfully", technology });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error while creating technology", error: error.message });
  };
};

// Controller for fetching all technology
export const fetchAllTechnology = async (req, res) => {
  try {
    let filter = { company: req.company };
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

    const technology = await Technology
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!technology) {
      return res.status(404).json({ success: false, message: "Technology not found" });
    };

    const totalCount = await Technology.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All technology fetched successfully", technology, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error while fetching all technology", error: error.message });
  };
};

// Controller for fetching a single technology
export const fetchSingleTechnology = async (req, res) => {
  try {
    const technologyId = req.params.id;

    const technology = await Technology
      .findOne({ _id: technologyId, company: req.company });

    if (!technology) {
      return res.status(404).json({ success: false, message: "Technology not found" });
    };

    return res.status(200).json({ success: true, message: "Single technology fetched successfully", technology });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error while fetching single technology", error: error.message });
  };
};

// Controller for updating a technology
export const updateTechnology = async (req, res) => {
  try {
    const technologyId = req.params.id;

    const { name, description } = req.body;

    const technology = await Technology
      .findByIdAndUpdate(technologyId, { name, description }, { new: true, runValidators: true });

    if (!technology) {
      return res.status(404).json({ success: false, message: "Technology not found" });
    };

    return res.status(200).json({ success: true, message: "Technology updated successfully", technology });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error while updating technology", error: error.message });
  };
};

// Controller for deleting a technology
export const deleteTechnology = async (req, res) => {
  try {
    const technologyId = req.params.id;

    const technology = await Technology
      .findByIdAndDelete(technologyId);

    if (!technology) {
      return res.status(400).json({ success: false, message: "Technology not found" });
    };

    return res.status(200).json({ success: true, message: "Technology deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error while deleting technology", error: error.message });
  };
};
