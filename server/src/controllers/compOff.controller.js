import CompOff from "../models/compOff.model.js";
import Team from "../models/team.model.js";
import mongoose from "mongoose";
import { sendEmail } from "../services/emailService.js";
import firebase from "../firebase/index.js";

// Create new comp off
export const createCompOff = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { employee, attendanceDate, date, approvedBy, status } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: "Worked date is required." });
    };

    if (!attendanceDate) {
      return res.status(400).json({ success: false, message: "Comp off date is required." });
    };

    if (!employee) {
      return res.status(400).json({ success: false, message: "Employee is required." });
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appliedDate = new Date(attendanceDate);
    appliedDate.setHours(0, 0, 0, 0);

    if (appliedDate <= today) {
      return res.status(400).json({ success: false, message: "Comp off date must be a future date." });
    };

    const existingCompOff = await CompOff.findOne({ employee, attendanceDate, date });

    if (existingCompOff) {
      if (existingCompOff?.status === "Approved" || existingCompOff?.status === "Pending") {
        return res.status(400).json({ success: false, message: `Comp off request for date ${attendanceDate} is already applied and status is ${existingCompOff?.status}.` });
      };
    };

    const compOff = new CompOff({ employee, attendanceDate, date, approvedBy, status });
    await compOff.save({ session });

    const updatedTeam = await Team.findOneAndUpdate(
      { _id: employee, "eligibleCompOffDate.date": date },
      { $set: { "eligibleCompOffDate.$.isApplied": true } },
      { new: true, session },
    );

    if (!updatedTeam) {
      throw new Error("Failed to update eligible comp off date");
    };

    const appliedBy = await Team.findById(employee).session(session);

    const subject = `${appliedBy?.name} apply comp off for date ${attendanceDate}`;
    const htmlContent = `<p>Comp off request has been applied by ${appliedBy?.name} for date ${attendanceDate}.</p><p>Please review the request.</p>`;
    sendEmail(process.env.RECEIVER_EMAIL_ID, subject, htmlContent);

    // Send push notification to admin
    const admins = await Team.find({ role: { name: 'admin' }, fcmToken: { $exists: true, $ne: null } });

    if (admins?.length > 0) {
      const adminFcmTokens = admins?.map((admin) => admin?.fcmToken);

      const payload = {
        notification: {
          title: `${appliedBy?.name} Applied for Comp Off`,
          body: `${appliedBy?.name} has applied for comp off for date ${attendanceDate}`,
        },
      };

      await Promise.allSettled(adminFcmTokens?.map((token) => firebase.messaging().send({ ...payload, token })));
    };

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ success: true, data: compOff });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get all Comp offs
export const getAllCompOffs = async (req, res) => {
  try {
    let query = {};
    let sort = {};

    // Filter by year only (all month)
    if (req.query.year && !req.query.month) {
      const year = req.query.year;
      query.attendanceDate = {
        $gte: `${year}-01-01`,
        $lte: `${year}-12-31`,
      };
    };

    // Filter by month only (all years)
    if (req.query.month && !req.query.year) {
      const month = req.query.month;
      query.attendanceDate = { $regex: `-${month}-`, $options: "i" };
    };

    // Filter by both year and month
    if (req.query.year && req.query.month) {
      const year = req.query.year;
      const month = req.query.month;

      query.attendanceDate = {
        $gte: `${year}-${month}-01`,
        $lte: `${year}-${month}-31`,
      };
    };

    // Filter by employee ID
    if (req.query.employeeId) {
      query.employee = req.query.employeeId;;
    };

    // Handle pagination
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    // Handle sorting
    if (req.query.sort === 'Ascending') {
      sort = { createdAt: 1 };
    } else {
      sort = { createdAt: -1 };
    };

    const compOffs = await CompOff.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("employee")
      .populate("approvedBy")
      .exec();

    if (!compOffs) {
      return res.status(404).json({ success: false, message: 'Comp off request not found' });
    };

    const total = await CompOff.countDocuments(query);

    return res.status(200).json({ success: true, data: compOffs, totalCount: total });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get a single comp off by ID
export const getCompOffById = async (req, res) => {
  try {
    const compOff = await CompOff
      .findById(req.params.id)
      .populate("employee")
      .populate("approvedBy")
      .exec();

    if (!compOff) {
      return res.status(404).json({ success: false, message: "Comp off request not found." });
    };

    return res.status(200).json({ success: true, data: compOff });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Controller to fetch Pending status data
export const getPendingCompOffRequests = async (req, res) => {
  try {
    const pendingRequests = await CompOff
      .find({ status: 'Pending' })
      .sort({ createdAt: -1 })
      .populate('employee', 'name')
      .exec();

    res.status(200).json({ success: true, data: pendingRequests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Update comp off request
export const updateCompOff = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { status, approvedBy } = req.body;

    const compOff = await CompOff
      .findById(id)
      .populate("employee")
      .session(session)
      .exec();

    if (!compOff) {
      return res.status(404).json({ success: false, message: "Comp off request not found." });
    };

    if (compOff?.status === "Approved" || compOff?.status === "Rejected") {
      return res.status(400).json({ success: false, message: "This comp off request has already been processed." });
    };

    if (compOff?.status === "Pending" && status === "Pending") {
      return res.status(400).json({ success: false, message: "This comp off request is already in pending." });
    };

    const approveBy = await Team
      .findById(approvedBy)
      .session(session);

    if (!approveBy) {
      throw new Error("Approver not found.");
    };

    if (status === "Rejected") {
      compOff.status = "Rejected";
      compOff.approvedBy = approvedBy;
      await compOff.save({ session });

      sendEmail(compOff?.employee?.email, "Your Comp Off Request Rejected", `<p>Your comp off request date ${compOff?.attendanceDate} has been rejected.</p><p>Regards,<br/>${approveBy?.name}</p>`);

      if (compOff?.employee?.fcmToken) {
        const payload = {
          notification: {
            title: "Comp Off Request Rejected",
            body: `Comp Off request for date ${compOff?.attendanceDate} has been rejected.`,
          },
        };
        await firebase.messaging().send({ ...payload, token: compOff?.employee?.fcmToken });
      };

      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({ success: true, message: "Comp off rejected." });
    };

    if (status === "Approved") {
      compOff.status = "Approved";
      compOff.approvedBy = approvedBy;
      await compOff.save({ session });

      const updatedTeam = await Team.findOneAndUpdate(
        { _id: compOff?.employee?._id, "eligibleCompOffDate.date": compOff?.date },
        { $set: { "eligibleCompOffDate.$.isApproved": true, "eligibleCompOffDate.$.approvedBy": approvedBy } },
        { new: true, session },
      );

      if (!updatedTeam) {
        throw new Error("Failed to update eligible comp off date.");
      };

      sendEmail(compOff?.employee?.email, "Your Comp Off Request Approved", `<p>Your comp off request date ${compOff?.attendanceDate} has been approved.</p><p>Regards,<br/>${approveBy?.name}</p>`);

      if (compOff?.employee?.fcmToken) {
        const payload = {
          notification: {
            title: "Comp Off Request Approved",
            body: `Comp off request for date ${compOff?.attendanceDate} has been approved.`,
          },
        };
        await firebase.messaging().send({ ...payload, token: compOff?.employee?.fcmToken });
      };

      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({ success: true, message: "Comp off request approved." });
    };

    return res.status(400).json({ success: false, message: "Invalid status provided." });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Delete a CompOff by ID
export const deleteCompOff = async (req, res) => {
  try {
    const compOff = await CompOff.findByIdAndDelete(req.params.id);

    if (!compOff) {
      return res.status(404).json({ success: false, message: "Comp off not found." });
    };

    return res.status(200).json({ success: true, message: "Comp off deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};
