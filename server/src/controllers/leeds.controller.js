import Leed from "../models/leeds.model.js";
import { validationResult } from "express-validator";

// Create a new lead
export const createLeed = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  };

  try {
    const leed = new Leed(req.body);
    await leed.save();
    res.status(201).json({ success: true, data: leed });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  };
};

// Get all leads with search, filter, sort, pagination
export const getAllLeeds = async (req, res) => {
  try {
    const { search, sortBy = "createdAt", sortOrder = "desc", page = 1, limit = 10, ...filters } = req.query;

    const query = {};

    // Search by name/email/requirement/message
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { requirement: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    };

    // Apply filters (e.g., mobile=1234567890)
    Object.keys(filters).forEach((key) => {
      query[key] = filters[key];
    });

    const skip = (page - 1) * limit;

    const total = await Leed.countDocuments(query);
    const leeds = await Leed.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: leeds,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  };
};

// Get a single lead
export const getLeedById = async (req, res) => {
  try {
    const leed = await Leed.findById(req.params.id);
    if (!leed) return res.status(404).json({ success: false, error: "Leed not found" });

    res.status(200).json({ success: true, data: leed });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  };
};

// Update a lead
export const updateLeed = async (req, res) => {
  try {
    const leed = await Leed.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!leed) return res.status(404).json({ success: false, error: "Leed not found" });

    res.status(200).json({ success: true, data: leed });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  };
};

// Delete a lead
export const deleteLeed = async (req, res) => {
  try {
    const leed = await Leed.findByIdAndDelete(req.params.id);
    if (!leed) return res.status(404).json({ error: "Leed not found" });

    res.status(200).json({ success: true, message: "Leed deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  };
};
