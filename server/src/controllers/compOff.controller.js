import CompOff from "../models/compOff.model.js";
import Team from "../models/team.model.js";
import Company from "../models/company.model.js";
import Holiday from "../models/holiday.model.js";
import mongoose from "mongoose";
import { sendEmail } from "../services/emailService.js";
import firebase from "../firebase/index.js";

// Create new comp off
export const createCompOff = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { employee, attendanceDate, compOffDate } = req.body;
    const company = req.company;

    if (!attendanceDate) {
      return res.status(400).json({ success: false, message: "Attendance date is required." });
    };

    if (!compOffDate) {
      return res.status(400).json({ success: false, message: "Comp off date is required." });
    };

    if (!employee) {
      return res.status(400).json({ success: false, message: "Employee is required." });
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appliedDate = new Date(attendanceDate);
    appliedDate.setHours(0, 0, 0, 0);

    if (appliedDate < today) {
      return res.status(400).json({ success: false, message: "Comp off date must be today or a future date.", });
    };

    if (appliedDate.getDay() === 0) {
      return res.status(400).json({ success: false, message: "Comp off can not be applied on a Sunday." });
    };

    const isHoliday = await Holiday.findOne({ date: attendanceDate, company });

    if (isHoliday) {
      return res.status(400).json({ success: false, message: "Comp off can not be applied on a holiday." });
    };

    const existingCompOff = await CompOff.findOne({ employee, attendanceDate, compOffDate, company });

    if (existingCompOff && ["Approved", "Pending"].includes(existingCompOff?.status)) {
      return res.status(400).json({ success: false, message: `Comp off request for ${attendanceDate} is already applied and status is ${existingCompOff?.status}.` });
    };

    const compOff = new CompOff({ employee, attendanceDate, compOffDate, company });
    await compOff.save({ session });

    const updatedTeam = await Team.findOneAndUpdate(
      { _id: employee, "eligibleCompOffDate.attendanceDate": attendanceDate, company },
      { $set: { "eligibleCompOffDate.$.isApplied": true } },
      { new: true, session },
    );

    if (!updatedTeam) {
      throw new Error("Failed to apply comp off request.");
    };

    const appliedBy = await Team.findOne({ _id: employee, company }).populate("office").session(session);

    if (appliedBy?.office?.noReplyEmail && appliedBy?.office?.noReplyEmailAppPassword) {
      const from = appliedBy?.office?.noReplyEmail;
      const to = from;
      const password = appliedBy?.office?.noReplyEmailAppPassword;
      const subject = `${appliedBy?.name} apply comp off for date ${compOffDate}`;
      const htmlContent = `<p>Comp off request has been applied by ${appliedBy?.name} for date ${compOffDate}.</p><p>Please review the request.</p>`;
      sendEmail(from, to, password, subject, htmlContent);
    };

    // Send push notification to admin
    const teams = await Company
      .find({ _id: appliedBy?.company })
      .populate({ path: 'role', select: "name" })
      .exec();

    const filteredAdmins = teams?.filter((team) => team?.role?.name?.toLowerCase() === "company" && team?.fcmToken);

    if (filteredAdmins?.length > 0) {
      const payload = {
        notification: {
          title: `${appliedBy?.name} Applied for Comp Off`,
          body: `${appliedBy?.name} has applied for comp off for date ${attendanceDate}.`,
        },
      };

      await Promise.allSettled(filteredAdmins?.map((admin) => firebase.messaging().send({ ...payload, token: admin?.fcmToken })));
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
    let query = { company: req.company };
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
      .findOne({ _id: req.params.id, company: req.company })
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

// Controller to fetch pending comp off status
export const getPendingCompOffRequests = async (req, res) => {
  try {
    const pendingRequests = await CompOff
      .find({ status: 'Pending', company: req.company })
      .sort({ createdAt: -1 })
      .populate('employee', 'name')
      .exec();

    return res.status(200).json({ success: true, data: pendingRequests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Update comp off request
export const updateCompOff = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { status } = req.body;
    const company = req.company;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required." });
    };

    const compOff = await CompOff
      .findOne({ _id: id, company })
      .populate("employee")
      .populate("employee.office")
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

    if (status === "Rejected") {
      compOff.status = "Rejected";
      await compOff.save({ session });

      const from = compOff?.employee?.office?.noReplyEmail;
      const to = compOff?.employee?.email;
      const password = compOff?.employee?.office?.noReplyEmailAppPassword;

      if (from && to && password) {
        sendEmail(from, to, password, "Your Comp Off Request Rejected", `<p>Your comp off request for date ${compOff?.compOffDate} has been rejected.</p><p>Regards,<br/>${compOff?.employee?.office?.name}</p>`);
      };

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
      await compOff.save({ session });

      const updatedTeam = await Team.findOneAndUpdate(
        {
          _id: compOff?.employee?._id,
          company,
          "eligibleCompOffDate.attendanceDate": compOff?.attendanceDate,
        },
        {
          $set: {
            "eligibleCompOffDate.$.isApproved": true,
            "eligibleCompOffDate.$.compOffDate": compOff?.compOffDate,
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!updatedTeam) {
        throw new Error("Failed to approve comp off request.");
      };

      const from = compOff?.employee?.office?.noReplyEmail;
      const to = compOff?.employee?.email;
      const password = compOff?.employee?.office?.noReplyEmailAppPassword;

      if (from && to && password) {
        sendEmail(from, to, "Your Comp Off Request Approved", `<p>Your comp off request for date ${compOff?.compOffDate} has been approved.</p><p>Regards,<br/>${compOff?.employee?.office?.name}</p>`);
      };

      if (compOff?.employee?.fcmToken) {
        const payload = {
          notification: {
            title: "Comp Off Request Approved",
            body: `Comp off request for date ${compOff?.compOffDate} has been approved.`,
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
    const compOff = await CompOff.findOneAndDelete({ _id: req.params.id, company: req.company });

    if (!compOff) {
      return res.status(404).json({ success: false, message: "Comp off not found." });
    };

    return res.status(200).json({ success: true, message: "Comp off deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};
