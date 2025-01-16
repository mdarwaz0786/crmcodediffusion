import Department from "../models/department.model.js";

// Controller for creating a department
export const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    const department = new Department({ name, description });
    await department.save();

    return res.status(200).json({ success: true, message: "Department created successfully", department });
  } catch (error) {
    console.log("Error while creating department:", error.message);
    return res.status(500).json({ success: false, message: `Error while creating department: ${error.message}` });
  };
};

// Helper function to build the projection object based on user permissions
const buildProjection = (permissions) => {
  const departmentFields = permissions.department.fields;
  const projection = {};

  for (const [key, value] of Object.entries(departmentFields)) {
    if (value.show) {
      projection[key] = 1;
    } else {
      projection[key] = 0;
    };
  };

  // Ensure _id, createdAt and updatedAt are included by default unless explicitly excluded
  projection._id = 1;
  projection.createdAt = 1;
  projection.updatedAt = 1;

  return projection;
};

// Helper function to filter fields based on projection
const filterFields = (department, projection) => {
  const filteredDepartment = {};

  for (const key in department._doc) {
    if (projection[key]) {
      filteredDepartment[key] = department[key];
    };
  };

  // Include _id, createdAt, and updatedAt if they were not excluded
  if (projection._id !== 0) {  // only exclude if explicitly set to 0
    filteredDepartment._id = department._id;
  };

  if (projection.createdAt !== 0) {
    filteredDepartment.createdAt = department.createdAt;
  };

  if (projection.updatedAt !== 0) {
    filteredDepartment.updatedAt = department.updatedAt;
  };

  return filteredDepartment;
};

// Controller for fetching all department
export const fetchAllDepartment = async (req, res) => {
  try {
    let filter = {};
    let sort = {};

    // Handle universal searching across all fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    };

    // Handle name search
    if (req.query.name) {
      filter.name = { $regex: new RegExp(req.query.name, 'i') };
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

    const department = await Department.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredDepartment = department.map((department) => filterFields(department, projection));
    const totalCount = await Department.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All department fetched successfully", department: filteredDepartment, totalCount });
  } catch (error) {
    console.log("Error while fetching all department:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching all department: ${error.message}` });
  };
};

// Controller for fetching a single department
export const fetchSingleDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;
    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredDepartment = filterFields(department, projection);

    return res.status(200).json({ success: true, message: "Single department fetched successfully", department: filteredDepartment });
  } catch (error) {
    console.log("Error while fetching single department:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching single department: ${error.message}` });
  };
};

// Controller for updating a department
export const updateDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;
    const { name, description } = req.body;

    const department = await Department.findByIdAndUpdate(departmentId, { name, description }, { new: true });

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    };

    return res.status(200).json({ success: true, message: "Department updated successfully", department });
  } catch (error) {
    console.log("Error while updating department:", error.message);
    return res.status(500).json({ success: false, message: `Error while updating department: ${error.message}` });
  };
};

// Controller for deleting a department
export const deleteDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;
    const department = await Department.findByIdAndDelete(departmentId);

    if (!department) {
      return res.status(400).json({ success: false, message: "Department not found" });
    };

    return res.status(200).json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    console.log("Error while deleting department:", error.message);
    return res.status(500).json({ success: false, message: `Error while deleting department: ${error.message}` });
  };
};
