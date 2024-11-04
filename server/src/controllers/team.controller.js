import Team from "../models/team.model.js";
import EmployeeId from "../models/employeeId.model.js";
import generateToken from "../utils/generateToken.js";
import mongoose from "mongoose";

// Helper function to generate the next employeeId
const getNextEmployeeId = async () => {
  const counter = await EmployeeId.findOneAndUpdate({ _id: "employeeId" }, { $inc: { sequence: 1 } }, { new: true, upsert: true });
  return `EmpID${counter.sequence.toString().padStart(3, "0")}`;
};

// Controller for creating a team
export const createTeam = async (req, res) => {
  try {
    const employeeId = await getNextEmployeeId();
    const { name, email, password, mobile, joining, dob, monthlySalary, requiredHoursPerDay, designation, role, reportingTo } = req.body;

    const team = new Team({ employeeId, name, email, password, mobile, joining, dob, monthlySalary, requiredHoursPerDay, designation, role, reportingTo });
    await team.save();

    return res.status(200).json({ success: true, message: "Employee created successfully", team });
  } catch (error) {
    console.log("Error while creating employee:", error.message);
    return res.status(500).json({ success: false, message: `Error while creating employee: ${error.message}` });
  };
};

// controller for login team member
export const loginTeam = async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    const team = await Team.findOne({ employeeId });

    if (!team) {
      return res.status(404).json({ success: false, message: "Invalid Employee ID" });
    };

    if (password !== team.password) {
      return res.status(401).json({ success: false, message: "Invalid Password" });
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      _id: team._id,
      employeeId: team.employeeId,
      name: team.name,
      email: team.email,
      mobile: team.mobile,
      password: team.password,
      joining: team.joining,
      dob: team.dob,
      monthlySalary: team.monthlySalary,
      requiredHoursPerDay: team.requiredHoursPerDay,
      designation: team.designation._id,
      role: team.role._id,
      reportingTo: team.reportingTo._id,
      token: generateToken(
        team._id,
        team.employeeId,
        team.name,
        team.email,
        team.mobile,
        team.password,
        team.joining,
        team.dob,
        team.monthlySalary,
        team.requiredHoursPerDay,
        team.designation._id,
        team.role._id,
        team.reportingTo._id,
      ),
    });
  } catch (error) {
    console.log("Error while login employee:", error.message);
    return res.status(500).json({ success: false, message: `Error while login employee: ${error.message}` });
  };
};

// Controller for fetching logged in employee
export const loggedInTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.team._id)
      .populate({ path: "role", select: "" })
      .populate({ path: "designation", select: "name" })
      .populate({ path: "reportingTo", select: "name" })
      .exec();

    if (!team) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    };

    return res.status(200).json({ success: true, message: 'Logged in employee fetched successfully', team });
  } catch (error) {
    console.log('Error while fetching logged in employee:', error.message);
    return res.status(500).json({ success: false, message: `Error while fetching logged in employee: ${error.message}` });
  };
};

// Helper function to build the projection object based on user permissions
const buildProjection = (permissions) => {
  const teamFields = permissions.team.fields;
  const projection = {};

  for (const [key, value] of Object.entries(teamFields)) {
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
const filterFields = (team, projection) => {
  const filteredTeam = {};

  for (const key in team._doc) {
    if (projection[key] !== 0) {  // only exclude if explicitly set to 0
      filteredTeam[key] = team[key];
    };
  };

  // Include _id, createdAt, and updatedAt if they were not excluded
  if (projection._id !== 0) {
    filteredTeam._id = team._id;
  };

  if (projection.createdAt !== 0) {
    filteredTeam.createdAt = team.createdAt;
  };

  if (projection.updatedAt !== 0) {
    filteredTeam.updatedAt = team.updatedAt;
  };

  return filteredTeam;
};

// Helper function to find ObjectId by string in referenced models
const findObjectIdByString = async (modelName, fieldName, searchString) => {
  const Model = mongoose.model(modelName);
  const result = await Model.findOne({ [fieldName]: { $regex: new RegExp(searchString, 'i') } }).select('_id');
  return result ? result._id : null;
};

// Helper function to find ObjectId array by string in referenced models
const findObjectIdArrayByString = async (modelName, fieldName, searchString) => {
  const Model = mongoose.model(modelName);
  const results = await Model.find({ [fieldName]: { $regex: new RegExp(searchString, 'i') } }).select('_id');
  return results.map((result) => result._id);
};

// Controller for fetching all employee
export const fetchAllTeam = async (req, res) => {
  try {
    let filter = {};
    let sort = {};

    // Handle universal searching across all fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { employeeId: { $regex: searchRegex } },
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { mobile: { $regex: searchRegex } },
        { password: { $regex: searchRegex } },
        { monthlySalary: { $regex: searchRegex } },
        { requiredHoursPerDay: { $regex: searchRegex } },
        { joining: { $regex: searchRegex } },
        { dob: { $regex: searchRegex } },
        { designation: await findObjectIdByString('Designation', 'name', req.query.search) },
        { role: await findObjectIdByString('Role', 'name', req.query.search) },
        { reportingTo: { $in: await findObjectIdArrayByString('Team', 'name', req.query.search) } },
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const team = await Team.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({ path: "role", select: "" })
      .populate({ path: "designation", select: "name" })
      .populate({ path: "reportingTo", select: "name" })
      .exec();

    if (!team) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredTeam = team.map((team) => filterFields(team, projection));
    const totalCount = await Team.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All employee fetched successfully", team: filteredTeam, totalCount });
  } catch (error) {
    console.log("Error while fetching all employee:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching all employee: ${error.message}` });
  };
};

// Controller for fetching a single employee
export const fetchSingleTeam = async (req, res) => {
  try {
    const teamId = req.params.id;

    const team = await Team.findById(teamId)
      .populate({ path: "role", select: "" })
      .populate({ path: "designation", select: "name" })
      .populate({ path: "reportingTo", select: "name" })
      .exec();

    if (!team) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredTeam = filterFields(team, projection);

    return res.status(200).json({ success: true, message: "Single employee fetched successfully", team: filteredTeam });
  } catch (error) {
    console.log("Error while fetching single employee:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching single employee: ${error.message}` });
  };
};

// Controller for updating a employee
export const updateTeam = async (req, res) => {
  try {
    const teamId = req.params.id;

    const team = await Team.findByIdAndUpdate(teamId, req.body, { new: true });

    if (!team) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    };

    return res.status(200).json({ success: true, message: "Employee updated successfully", team });
  } catch (error) {
    console.log("Error while updating employee:", error.message);
    return res.status(500).json({ success: false, message: `Error while updating employee: ${error.message}` });
  };
};

// Controller for deleting a employee
export const deleteTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    const team = await Team.findByIdAndDelete(teamId);

    if (!team) {
      return res.status(400).json({ success: false, message: "Employee not found" });
    };

    return res.status(200).json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    console.log("Error while deleting employee:", error.message);
    return res.status(500).json({ success: false, message: `Error while deleting employee: ${error.message}` });
  };
};
