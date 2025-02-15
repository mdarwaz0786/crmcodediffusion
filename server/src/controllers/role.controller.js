import Role from "../models/role.model.js";

// Controller for create role
export const createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required." });
    };

    const role = new Role({ name, permissions });
    await role.save();

    return res.status(201).json({ success: true, meaasge: "Role created successfully", role });
  } catch (error) {
    return res.status(500).json({ success: false, meaasge: `Error while creatinng role: ${error.message}` });
  };
};

// Controller for fetching all role
export const fetchAllRole = async (req, res) => {
  try {
    let filter = {};
    let sort = {};

    // Handle searching across all fields
    if (req.query.search) {
      filter.name = { $regex: new RegExp(req.query.search.trim(), 'i') };
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

    const role = await Role
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    };

    const totalCount = await Role.countDocuments(filter);

    return res.status(200).json({ success: true, meaasge: "All role fetched successfully", role, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, meaasge: `Error while fetching all role: ${error.message}` });
  };
};

// Controller for fetching single role
export const fetchSingleRole = async (req, res) => {
  try {
    const role = await Role
      .findById(req.params.id);

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    };

    return res.status(200).json({ success: true, message: 'Single role fetched successfully', role });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching single role: ${error.message}` });
  };
};

// Controller for Update role
export const updateRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    const role = await Role
      .findByIdAndUpdate(req.params.id, { name, permissions }, { new: true });

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    };

    return res.status(200).json({ success: true, message: 'Role updated successfully', role });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while updating role: ${error.message}` });
  };
};

// Delete a role by ID
export const deleteRole = async (req, res) => {
  try {
    const role = await Role
      .findByIdAndDelete(req.params.id);

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    };

    return res.status(200).json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while updating role: ${error.message}` });
  };
};


