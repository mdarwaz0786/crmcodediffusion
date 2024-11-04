import Attendance from "../models/attendance.model.js";
import Employee from "../models/team.model.js";

// Create Attendance
export const createAttendance = async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  };
};

// Read all Attendance
export const fetchAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find().populate("employee");
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  };
};

// Read Attendance by ID
export const fetchSingleAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate("employee");
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  };
};

// Update Attendance
export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });
    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  };
};

// Delete Attendance
export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });
    res.json({ message: "Attendance deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  };
};

// Calculate Monthly Salary
export const calculateMonthlySalary = async (req, res) => {
  const { employeeId, year, month } = req.params;

  try {
    const employee = await Employee.findById(employeeId);
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyRate = employee.monthlySalary / 30;

    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      date: {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month - 1, daysInMonth),
      },
    });

    let totalDeductions = 0;
    let absencesWithoutDeduction = 0;

    attendanceRecords.forEach((record) => {
      if (record.attendanceStatus === "Absent" && absencesWithoutDeduction < 2) {
        absencesWithoutDeduction++;
      } else if (record.attendanceStatus === "Absent" || (record.attendanceStatus === "Half Day" && !record.halfDayLeaveApproved)) {
        totalDeductions += record.salaryDeductionForDay;
      };
    });

    const totalSalary = employee.monthlySalary - totalDeductions;

    res.json({
      employeeId,
      totalSalary,
      details: {
        totalDays: daysInMonth,
        absencesWithoutDeduction,
        deductions: totalDeductions,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  };
};
