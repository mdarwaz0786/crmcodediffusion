import CompOff from "../models/compOff.model.js";
import Attendance from "../models/attendance.model.js";
import Team from "../models/team.model.js";
import { sendEmail } from "../services/emailService.js";

// Create a new comp off
export const createCompOff = async (req, res) => {
  try {
    const { employee, attendanceDate, status } = req.body;

    if (!employee || !attendanceDate) {
      return res.status(400).json({ success: false, message: "Employee and attendance date are required." });
    };

    const existingCompOff = await CompOff.findOne({ employee, attendanceDate });

    if (existingCompOff) {
      return res.status(400).json({ success: false, message: `Comp off already exists for this date ${attendanceDate}` });
    };

    const compOff = new CompOff({ employee, attendanceDate, status });
    await compOff.save();

    const emp = await Team.findOne({ employee });

    // Send email to when comp off is created
    await sendEmail(
      process.env.RECEIVER_EMAIL_ID,
      `${emp.name} apply comp off for date ${attendanceDate}`,
      `<p>Comp off request has been submitted by ${emp.name} for date ${attendanceDate}.</p>
      <p>Pleave review the request.</p>`
    );

    res.status(201).json({ success: true, message: "Comp off created successfully.", data: compOff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Read (Get all Comp offs)
export const getAllCompOffs = async (req, res) => {
  try {
    const compOffs = await CompOff.find().populate("employee");
    res.status(200).json({ success: true, data: compOffs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};

// Read (Get a single comp off by ID)
export const getCompOffById = async (req, res) => {
  try {
    const compOff = await CompOff.findById(req.params.id).populate("employee");
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
    const { status } = req.body;

    const compOff = await CompOff.findById(id).populate("employee");

    if (!compOff) {
      return res.status(404).json({ success: false, message: "Comp off request not found." });
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
      await compOff.save();
      await sendEmail(
        compOff.employee.email,
        "CompOff Request Update to Pending",
        `<p>Your comp off request dated ${compOff.attendanceDate} has been marked as Pending.</p>
        <p>Regards,<br/>HR Team</p>`
      );
      return res.status(200).json({ success: true, message: "Comp off request marked as pending." });
    };

    if (status === "Rejected") {
      compOff.status = "Rejected";
      await compOff.save();
      await sendEmail(
        compOff.employee.email,
        "Your Comp Off Request Rejected",
        `<p>Your comp off request dated ${compOff.attendanceDate} has been rejected.</p>
         <p>Regards,<br/>HR Team</p>`
      );
      return res.status(200).json({ success: true, message: "Comp off request marked as rejected." });
    };

    if (status === "Approved") {
      // Check if attendance already marked as comp off
      if (attendance && attendance.status === "CompOff") {
        return res.status(400).json({ success: false, message: "Attendance already marked as comp off." });
      };

      // Mark attendance as comp off or create a new record if not exists
      if (!attendance) {
        await Attendance.create({
          employee: compOff.employee,
          attendanceDate: compOff.attendanceDate,
          status: "CompOff",
          punchInTime: null,
          punchOutTime: null,
          punchIn: true,
          punchOut: true,
        });
      } else {
        attendance.status = "CompOff";
        attendance.punchInTime = null;
        attendance.punchOutTime = null;
        attendance.punchIn = true;
        attendance.punchOut = true;
        await attendance.save();
      };

      compOff.status = "Approved";
      await compOff.save();

      await sendEmail(
        compOff.employee.email,
        "Ypur Comp Off Request Approved",
        `<p>Your comp off request dated ${compOff.attendanceDate} has been approved.</p>
         <p>Regards,<br/>HR Team</p>`
      );
      return res.status(200).json({ success: true, message: "Comp off approved and attendance updated." });
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
