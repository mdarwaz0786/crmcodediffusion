import Role from "../models/role.model.js";

// Controller for create role
export const createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    const role = new Role({ name, permissions });
    await role.save();

    res.status(201).json({ success: true, meaasge: "Role created successfully", role });
  } catch (error) {
    console.log("Error while creatinng role:", error.message);
    res.status(500).json({ success: false, meaasge: `Error while creatinng role: ${error.message}` });
  };
};

// Helper function to build the projection object based on user permissions
const buildProjection = (permissions) => {
  const roleFields = permissions.role.fields;
  const projection = {};

  for (const [key, value] of Object.entries(roleFields)) {
    if (value.show) {
      projection[key] = 1;
    } else {
      projection[key] = 0;
    };
  };

  if (projection._id === undefined) {
    projection._id = 1;
  };

  return projection;
};

// Helper function to filter fields based on projection
const filterFields = (role, projection) => {
  const filteredRole = {};

  for (const key in role._doc) {
    if (projection[key]) {
      filteredRole[key] = role[key];
    };
  };

  if (projection._id !== undefined && !filteredRole._id) {
    filteredRole._id = role._id;
  };

  return filteredRole;
};

// Controller for fetching all role
export const fetchAllRole = async (req, res) => {
  try {
    let filter = {};
    let sort = {};

    // Handle universal searching across all fields
    if (req.query.search) {
      filter.name = { $regex: new RegExp(req.query.search, 'i') };
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const role = await Role.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredRole = role.map((role) => filterFields(role, projection));
    const totalCount = await Role.countDocuments(filter);

    res.status(200).json({ success: true, meaasge: "All role fetched successfully", role: filteredRole, totalCount });
  } catch (error) {
    console.log("Error while fetching all role:", error.message);
    res.status(500).json({ success: false, meaasge: `Error while fetching all role: ${error.message}` });
  };
};

// Controller for fetching single role
export const fetchSingleRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    };

    res.status(200).json({ success: true, message: 'Single role fetched successfully', role });
  } catch (error) {
    console.log("Error while fetching single role:", error.message);
    res.status(500).json({ success: false, message: `Error while fetching single role: ${error.message}` });
  };
};

// Controller for Update role
export const updateRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    const role = await Role.findByIdAndUpdate(req.params.id, { name, permissions }, { new: true });

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    };

    res.status(200).json({ success: true, message: 'Role updated successfully', role });
  } catch (error) {
    console.log("Error while updating role:", error.message);
    res.status(500).json({ success: false, message: `Error while updating role: ${error.message}` });
  };
};

// Delete a role by ID
export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    };

    res.status(200).json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    console.log("Error while deleting role:", error.message);
    res.status(500).json({ success: false, message: `Error while updating role: ${error.message}` });
  };
};


