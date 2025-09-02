import Company from "../models/company.model.js";

// Create Company
export const createCompany = async (req, res) => {
  try {
    const { companyName, mobile, email, password, role, numberOfEmployee, employeeIdPrefix, projectIdPrefix, punchInTime, punchOutTime, halfDayThreshold, weeklyOff, paidLeavePerMonth, leaveSystemStartDate } = req.body;

    const superadmin = req.isSuperAdmin;

    if (!superadmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Super admin access required" });
    };

    const existing = await Company.findOne({ email });

    if (existing) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    };

    let logo = null;

    if (req.file) {
      const file = req.file;
      logo = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    };

    const newCompany = await Company.create({
      companyName,
      logo,
      mobile,
      email,
      password,
      role,
      numberOfEmployee,
      employeeIdPrefix,
      projectIdPrefix,
      punchInTime,
      punchOutTime,
      halfDayThreshold,
      weeklyOff,
      paidLeavePerMonth,
    });

    return res.status(201).json({ success: true, message: "Company created successfully", data: newCompany });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  };
};

// Controller for fetching logged in company
export const loggedInCompany = async (req, res) => {
  try {
    const company = await Company
      .findById(req.team?._id)
      .populate({ path: "role", select: "" })
      .exec();

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    };

    return res.status(200).json({ success: true, message: 'Logged in company fetched successfully', team: company });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching logged in company: ${error.message}` });
  };
};

// Get All Companies
export const getCompanies = async (req, res) => {
  try {
    const superadmin = req.isSuperAdmin;

    if (!superadmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Super admin access required" });
    };

    let filter = {};
    let sort = {};

    if (req.query.search) {
      const search = req.query.search.trim();
      filter.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    };

    if (req.query.name) {
      filter.companyName = { $regex: new RegExp(req.query.name.trim(), 'i') };
    };

    if (req.query.nameFilter) {
      filter.companyName = { $in: Array.isArray(req.query.nameFilter) ? req.query.nameFilter : [req.query.nameFilter] };
    };

    if (req.query.sort === 'Ascending') {
      sort = { createdAt: 1 };
    } else {
      sort = { createdAt: -1 };
    };

    if (!req.query.status || req.query.status === "Active") {
      filter.isActive = true;
    } else if (req.query.status === "Inactive") {
      filter.isActive = false;
    };

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const total = await Company.countDocuments(filter);

    const companies = await Company
      .find(filter)
      .populate("role")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      totalCount: total,
      page,
      limit,
      data: companies,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  };
};

// Get Company by Id
export const getCompany = async (req, res) => {
  try {
    const superadmin = req.isSuperAdmin;

    if (!superadmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Super admin access required" });
    };

    const { id } = req.params;
    const company = await Company.findById(id).populate("role");

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    };

    return res.json({ success: true, data: company });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  };
};

// Update Company
export const updateCompany = async (req, res) => {
  try {
    const superadmin = req.isSuperAdmin;

    if (!superadmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Super admin access required" });
    };

    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      const file = req.file;
      const logo = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
      updateData.logo = logo;
    };

    const updated = await Company.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select("-password");;

    if (!updated) {
      return res.status(404).json({ success: false, message: "Company not found" });
    };

    return res.json({ success: true, message: "Company updated successfully", data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  };
};

// Delete Company
export const deleteCompany = async (req, res) => {
  try {
    const superadmin = req.isSuperAdmin;

    if (!superadmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Super admin access required" });
    };

    const { id } = req.params;
    const deleted = await Company.findByIdAndDelete(id).select("-password");

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Company not found" });
    };

    return res.json({ success: true, message: "Company deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  };
};
