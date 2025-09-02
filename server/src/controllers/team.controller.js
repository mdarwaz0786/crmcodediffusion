import Team from "../models/team.model.js";
import Company from "../models/company.model.js";
import generateToken from "../utils/generateToken.js";
import mongoose from "mongoose";

// Controller for creating a team
export const createTeam = async (req, res) => {
  try {
    const company = req.company;

    const comp = await Company
      .findOne({ _id: company })
      .select("numberOfEmployee employeeIdPrefix");

    if (!comp) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    };

    const employees = await Team.countDocuments({ company });

    if (employees >= comp?.numberOfEmployee) {
      return res.status(400).json({
        success: false,
        message: `Employee limit reached. Your plan allows only ${comp?.numberOfEmployee} employees.`,
      });
    };

    const lastEmployee = await Team
      .findOne({ company })
      .sort({ createdAt: -1 })
      .select("employeeId");

    let nextEmployeeId;

    if (!lastEmployee || !lastEmployee?.employeeId) {
      nextEmployeeId = `${comp?.employeeIdPrefix}001`;
    } else {
      const prefix = comp?.employeeIdPrefix;
      const lastIdNum = parseInt(lastEmployee?.employeeId?.replace(prefix, ""));
      const newIdNum = lastIdNum + 1;
      nextEmployeeId = `${prefix}${String(newIdNum).padStart(3, "0")}`;
    };

    const team = new Team({
      ...req.body,
      company,
      employeeId: nextEmployeeId,
    });

    await team.save();

    return res.status(200).json({
      success: true,
      message: "Employee created successfully",
      team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error while creating employee: ${error.message}`,
    });
  };
};

// controller for login team member
export const loginTeam = async (req, res) => {
  try {
    const { employeeId, password, fcmToken, deviceId, appLogin } = req.body;

    const team = await Team.findOne({ employeeId });

    if (!team) {
      return res.status(404).json({ success: false, message: "Invalid Employee ID" });
    };

    if (password !== team.password) {
      return res.status(401).json({ success: false, message: "Invalid Password" });
    };

    if (appLogin) {
      if (!team.allowMultiDevice) {
        if (!team.deviceId) {
          team.deviceId = deviceId;
          await team.save();
        } else if (team.deviceId !== deviceId) {
          return res.status(403).json({ success: false, message: "You are not authorized to login in this device." });
        };
      } else {
        team.deviceId = deviceId;
        await team.save();
      };
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
        team?.deviceId,
        team?.allowMultiDevice,
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
      .findById(req.team?._id)
      .populate({ path: "role", select: "" })
      .populate({ path: "designation", select: "name" })
      .populate({ path: "reportingTo", select: "name" })
      .populate({ path: "department", select: "name" })
      .populate({ path: "office", select: "" })
      .populate({ path: "company", select: "-password" })
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
    let filter = { company: req.company };
    let sort = {};

    // Handle searching across all fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { employeeId: { $regex: searchRegex } },
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { mobile: { $regex: searchRegex } },
        { joining: { $regex: searchRegex } },
        { dob: { $regex: searchRegex } },
        { designation: await findObjectIdByString('Designation', 'name', req.query.search) },
        { department: await findObjectIdByString('Department', 'name', req.query.search) },
        { office: await findObjectIdByString('OfficeLocation', 'name', req.query.search) },
        { role: await findObjectIdByString('Role', 'name', req.query.search) },
        { reportingTo: { $in: await findObjectIdArrayByString('Team', 'name', req.query.search) } },
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

    // Status filter
    if (!req.query.status || req.query.status === "Active") {
      filter.isActive = true;
    } else if (req.query.status === "Inactive") {
      filter.isActive = false;
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
      .populate({ path: "company", select: "-password" })
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
      .findOne({ _id: teamId, company: req.company })
      .populate({ path: "role", select: "" })
      .populate({ path: "designation", select: "name" })
      .populate({ path: "reportingTo", select: "name" })
      .populate({ path: "department", select: "name" })
      .populate({ path: "office", select: "" })
      .populate({ path: "company", select: "-password" })
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
      .findOneAndUpdate({ _id: teamId, company: req.company }, req.body, { new: true, runValidators: true });

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
      .findOneAndDelete({ _id: teamId, company: req.company });

    if (!team) {
      return res.status(400).json({ success: false, message: "Employee not found" });
    };

    return res.status(200).json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while deleting employee: ${error.message}` });
  };
};
