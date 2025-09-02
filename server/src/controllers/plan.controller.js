import Plan from "../models/payment.model.js";

// Create Plan
export const createPlan = async (req, res) => {
  try {
    const superadmin = req.isSuperAdmin;

    if (!superadmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Super admin access required" });
    };

    const newPlan = await Plan.create(req.body);

    return res.status(201).json({
      success: true,
      data: newPlan,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  };
};

// READ all Plan
export const getPlans = async (req, res) => {
  try {
    const superadmin = req.isSuperAdmin;

    if (!superadmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Super admin access required" });
    };

    let { page, limit, search, sortBy, sortOrder, isPaid, minMrp, maxMrp } = req.query;

    // Defaults
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    sortOrder = sortOrder === "asc" ? 1 : -1;

    const query = {};

    // Search (on planName)
    if (search) {
      query.planName = { $regex: search, $options: "i" };
    };

    // Filter by isPaid
    if (isPaid !== undefined) {
      query.isPaid = isPaid === "true";
    };

    // Filter by mrp range
    if (minMrp || maxMrp) {
      query["planDetail.mrp"] = {};
      if (minMrp) query["planDetail.mrp"].$gte = parseFloat(minMrp);
      if (maxMrp) query["planDetail.mrp"].$lte = parseFloat(maxMrp);
    };

    // Sorting
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder;
    } else {
      sort.createdAt = -1;
    };

    // Pagination
    const skip = (page - 1) * limit;

    const total = await Plan.countDocuments(query);

    const plans = await Plan.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: plans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  };
};

// READ single Plan
export const getPlanById = async (req, res) => {
  try {
    const superadmin = req.isSuperAdmin;

    if (!superadmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Super admin access required" });
    };

    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    };

    return res.status(200).json({ success: true, data: plan });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// UPDATE Plan
export const updatePlan = async (req, res) => {
  try {
    const superadmin = req.isSuperAdmin;

    if (!superadmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Super admin access required" });
    };

    const updatedPlan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedPlan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    };

    return res.status(200).json({ success: true, data: updatedPlan });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  };
};

// DELETE Plan
export const deletePlan = async (req, res) => {
  try {
    const superadmin = req.isSuperAdmin;

    if (!superadmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Super admin access required" });
    };

    const deletedPlan = await Plan.findByIdAndDelete(req.params.id);

    if (!deletedPlan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    };

    return res.status(200).json({ success: true, message: "Plan deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};
