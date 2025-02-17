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
    // Create a new team without employeeId initially
    const team = new Team(req.body);
    await team.save();

    // Generate the next employeeId only after successful save
    const employeeId = await getNextEmployeeId();

    // Update the team document with the generated employeeId
    team.employeeId = employeeId;
    await team.save();

    return res.status(200).json({ success: true, message: "Employee created successfully", team });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while creating employee: ${error.message}` });
  };
};

// controller for login team member
export const loginTeam = async (req, res) => {
  try {
    const { employeeId, password, fcmToken } = req.body;

    const team = await Team.findOne({ employeeId });

    if (!team) {
      return res.status(404).json({ success: false, message: "Invalid Employee ID" });
    };

    if (password !== team.password) {
      return res.status(401).json({ success: false, message: "Invalid Password" });
    };

    if (!!fcmToken) {
      team.fcmToken = fcmToken;
      await team.save();
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(
        team?._id,
        team?.employeeId,
        team?.name,
        team?.email,
        team?.mobile,
        team?.password,
        team?.joining,
        team?.dob,
        team?.monthlySalary,
        team?.workingHoursPerDay,
        team?.designation?._id,
        team?.role?._id,
        team?.reportingTo?._id,
        team?.PAN,
        team?.UAN,
        team?.bankAccount,
        team?.office?._id,
        team?.department?._id,
        team?.allotedLeaveBalance,
        team?.currentLeaveBalance,
        team?.usedLeaveBalance,
        team?.leaveBalanceAllotedHistory,
        team?.approvedLeaves,
        team?.eligibleCompOffDate,
        team?.isActive,
        team?.fcmToken,
        "Employee",
      ),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while login employee: ${error.message}` });
  };
};

// Controller for fetching logged in employee
export const loggedInTeam = async (req, res) => {
  try {
    const team = await Team
      .findById(req.team._id)
      .populate({ path: "role", select: "" })
      .populate({ path: "designation", select: "name" })
      .populate({ path: "reportingTo", select: "name" })
      .populate({ path: "department", select: "name" })
      .populate({ path: "office", select: "" })
      .exec();

    if (!team) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    };

    return res.status(200).json({ success: true, message: 'Logged in employee fetched successfully', team });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching logged in employee: ${error.message}` });
  };
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

    // Handle searching across all fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { employeeId: { $regex: searchRegex } },
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { mobile: { $regex: searchRegex } },
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
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const team = await Team
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({ path: "role", select: "" })
      .populate({ path: "designation", select: "name" })
      .populate({ path: "reportingTo", select: "name" })
      .populate({ path: "department", select: "name" })
      .populate({ path: "office", select: "" })
      .exec();

    if (!team) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    };

    const totalCount = await Team.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All employee fetched successfully", team, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching all employee: ${error.message}` });
  };
};

// Controller for fetching a single employee
export const fetchSingleTeam = async (req, res) => {
  try {
    const teamId = req.params.id;

    const team = await Team
      .findById(teamId)
      .populate({ path: "role", select: "" })
      .populate({ path: "designation", select: "name" })
      .populate({ path: "reportingTo", select: "name" })
      .populate({ path: "department", select: "name" })
      .populate({ path: "office", select: "" })
      .exec();

    if (!team) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    };

    return res.status(200).json({ success: true, message: "Single employee fetched successfully", team });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching single employee: ${error.message}` });
  };
};

// Controller for updating a employee
export const updateTeam = async (req, res) => {
  try {
    const teamId = req.params.id;

    const team = await Team
      .findByIdAndUpdate(teamId, req.body, { new: true });

    if (!team) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    };

    return res.status(200).json({ success: true, message: "Employee updated successfully", team });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while updating employee: ${error.message}` });
  };
};

// Controller for deleting a employee
export const deleteTeam = async (req, res) => {
  try {
    const teamId = req.params.id;

    const team = await Team
      .findByIdAndDelete(teamId);

    if (!team) {
      return res.status(400).json({ success: false, message: "Employee not found" });
    };

    return res.status(200).json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while deleting employee: ${error.message}` });
  };
};
