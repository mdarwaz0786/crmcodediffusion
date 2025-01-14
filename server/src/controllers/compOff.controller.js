import CompOff from "../models/compOff.model.js";
import Attendance from "../models/attendance.model.js";
import Team from "../models/team.model.js";
import { sendEmail } from "../services/emailService.js";

// Create a new comp off
export const createCompOff = async (req, res) => {
  try {
    const { employee, attendanceDate, approvedBy, status } = req.body;

    if (!employee) {
      return res.status(400).json({ success: false, message: "Employee is required." });
    };

    if (!attendanceDate) {
      return res.status(400).json({ success: false, message: "Date is required." });
    };

    const existingCompOff = await CompOff.findOne({ employee, attendanceDate });

    if (existingCompOff) {
      return res.status(400).json({ success: false, message: `Comp off already applied for date ${attendanceDate}` });
    };

    const compOff = new CompOff({ employee, attendanceDate, approvedBy, status });

    await compOff.save();

    const emp = await Team.findById(employee);

    // Send email after comp off is created
    const subject = `${emp.name} apply comp off for date ${attendanceDate}`;

    const htmlContent =
      `<p>Comp off request has been submitted by ${emp.name} for date ${attendanceDate}.</p>
      <p>Pleave review the request.</p>`

    sendEmail(process.env.RECEIVER_EMAIL_ID, subject, htmlContent);

    res.status(201).json({ success: true, message: "Comp off created successfully.", data: compOff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Read (Get all Comp offs)
export const getAllCompOffs = async (req, res) => {
  try {
    const query = {};
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

    // Filter by employee ID if provided
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
      return res.status(404).json({ success: false, message: 'Comp off not found' });
    };

    // Calculate total count
    const total = await CompOff.countDocuments(query);

    res.status(200).json({ success: true, data: compOffs, totalCount: total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Read (Get a single comp off by ID)
export const getCompOffById = async (req, res) => {
  try {
    const compOff = await CompOff.findById(req.params.id).populate("employee").populate("approvedBy");
    if (!compOff) {
      return res.status(404).json({ success: false, message: "Comp off not found." });
    };
    res.status(200).json({ success: true, data: compOff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Update comp off request and handle attendance based on status
export const updateCompOff = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy } = req.body;

    const compOff = await CompOff.findById(id).populate("employee");

    if (!compOff) {
      return res.status(404).json({ success: false, message: "Comp off not found." });
    };

    const attendance = await Attendance.findOne({
      employee: compOff.employee,
      attendanceDate: compOff.attendanceDate,
    });

    // If approved and changing to pending or rejected, revert attendance
    if (compOff.status === "Approved" && (status === "Pending" || status === "Rejected")) {
      if (attendance) {
        attendance.status = "Absent";
        attendance.punchInTime = null;
        attendance.punchOutTime = null;
        attendance.punchIn = false;
        attendance.punchOut = false;
        await attendance.save();
      };
    };

    // Handle status transitions
    if (status === "Pending") {
      compOff.status = "Pending";
      compOff.approvedBy = approvedBy;
      await compOff.save();
      sendEmail(
        compOff.employee.email,
        "Comp Off Request Update to Pending",
        `<p>Your comp off request dated ${compOff.attendanceDate} has been marked as Pending.</p>
        <p>Regards,<br/>HR Team</p>`
      );
      return res.status(200).json({ success: true, message: "Comp off request marked as pending." });
    };

    if (status === "Rejected") {
      compOff.status = "Rejected";
      compOff.approvedBy = approvedBy;
      await compOff.save();
      sendEmail(
        compOff.employee.email,
        "Your Comp Off Request Rejected",
        `<p>Your comp off request dated ${compOff.attendanceDate} has been rejected.</p>
         <p>Regards,<br/>HR Team</p>`
      );
      return res.status(200).json({ success: true, message: "Comp off rejected." });
    };

    if (status === "Approved") {
      // Check if attendance already marked as comp off
      if (attendance && attendance.status === "CompOff") {
        return res.status(400).json({ success: false, message: "Attendance already exist as comp off." });
      };

      // Mark existing attendance as comp off or create a new if not exists
      if (!attendance) {
        await Attendance.create({
          employee: compOff.employee,
          attendanceDate: compOff.attendanceDate,
          status: "Comp Off",
          punchInTime: null,
          punchOutTime: null,
          punchIn: false,
          punchOut: false,
          hoursWorked: "00:00",
          lateIn: "00:00",
        });
      } else {
        attendance.status = "Comp Off";
        attendance.punchInTime = null;
        attendance.punchOutTime = null;
        attendance.punchIn = false;
        attendance.punchOut = false;
        attendance.hoursWorked = "00:00";
        attendance.lateIn = "00:00";
        await attendance.save();
      };

      compOff.status = "Approved";
      compOff.approvedBy = approvedBy;
      await compOff.save();

      sendEmail(
        compOff.employee.email,
        "Your Comp Off Request Approved",
        `<p>Your comp off request dated ${compOff.attendanceDate} has been approved.</p>
         <p>Regards,<br/>HR Team</p>`
      );
      return res.status(200).json({ success: true, message: "Comp off approved and attendance marked as comp off." });
    };

    res.status(400).json({ success: false, message: "Invalid status provided." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Delete a CompOff by ID
export const deleteCompOff = async (req, res) => {
  try {
    const compOff = await CompOff.findByIdAndDelete(req.params.id);

    if (!compOff) {
      return res.status(404).json({ success: false, message: "Comp off not found." });
    };

    res.status(200).json({ success: true, message: "Comp off deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};
