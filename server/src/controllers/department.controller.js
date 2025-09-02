import Department from "../models/department.model.js";

// Controller for creating a department
export const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const company = req.company;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required." });
    };

    const department = new Department({ name, description, company });
    await department.save();

    return res.status(200).json({ success: true, message: "Department created successfully", department });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while creating department: ${error.message}` });
  };
};

// Controller for fetching all department
export const fetchAllDepartment = async (req, res) => {
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

    const department = await Department
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    };

    const totalCount = await Department.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All department fetched successfully", department, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching all department: ${error.message}` });
  };
};

// Controller for fetching a single department
export const fetchSingleDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;

    const department = await Department
      .findOne({ _id: departmentId, company: req.company });

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    };

    return res.status(200).json({ success: true, message: "Single department fetched successfully", department, });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching single department: ${error.message}` });
  };
};

// Controller for updating a department
export const updateDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;

    const { name, description } = req.body;

    const department = await Department
      .findOneAndUpdate({ _id: departmentId, company: req.company }, { name, description }, { new: true, runValidators: true });

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    };

    return res.status(200).json({ success: true, message: "Department updated successfully", department });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while updating department: ${error.message}` });
  };
};

// Controller for deleting a department
export const deleteDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;

    const department = await Department
      .findOneAndDelete({ _id: departmentId, company: req.company });

    if (!department) {
      return res.status(400).json({ success: false, message: "Department not found" });
    };

    return res.status(200).json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while deleting department: ${error.message}` });
  };
};
