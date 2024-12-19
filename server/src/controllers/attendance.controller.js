import Attendance from '../models/attendance.model.js';
import Team from "../models/team.model.js";
import mongoose from 'mongoose';

// Helper: Calculate time difference in HH:mm format
const calculateTimeDifference = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    const differenceMinutes = Math.max(endTotalMinutes - startTotalMinutes, 0);
    const hours = Math.floor(differenceMinutes / 60);
    const minutes = differenceMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// Create or Update Attendance with Punch-in
export const createAttendance = async (req, res) => {
    try {
        const { employee, attendanceDate, punchInTime } = req.body;

        if (!employee || !attendanceDate || !punchInTime) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        };

        const EXPECTED_PUNCH_IN = "10:00";

        // Calculate lateIn
        const lateIn = calculateTimeDifference(EXPECTED_PUNCH_IN, punchInTime);

        // Use atomic operation to ensure no duplicate punch-in
        const result = await Attendance.findOneAndUpdate(
            { employee, attendanceDate, punchIn: false },
            {
                $set: {
                    punchInTime,
                    punchIn: true,
                    status: "Present",
                    lateIn,
                },
            },
            { upsert: true, new: true }
        );

        if (result.punchIn && result.punchInTime !== punchInTime) {
            return res.status(400).json({ success: false, message: "Punch in already exists" });
        };

        return res.status(201).json({ success: true, message: "Punch in successful", attedance: result });
    } catch (error) {
        // Handle duplicate entry due to index constraint
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: "Duplicate entry for employee and date" });
        };
        console.log(error.message);
        return res.status(500).json({ success: false, error: error.message });
    };
};

// Get all attendance
export const fetchAllAttendance = async (req, res) => {
    try {
        const { date, employeeId } = req.query;
        const query = {};
        let sort = {};

        // Filter by exact date if provided
        if (date) {
            query.attendanceDate = date;
        };

        // Filter by year only
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
            query.attendanceDate = { $regex: `-${month}-`, $options: "i" }; // Match the month in the date string
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
        if (employeeId) {
            if (mongoose.Types.ObjectId.isValid(employeeId)) {
                query.employee = employeeId;
            } else {
                return res.status(400).json({ success: false, message: 'Invalid employee ID' });
            };
        };

        // Handle pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 31;
        const skip = (page - 1) * limit;

        // Handle sorting
        if (req.query.sort === 'Ascending') {
            sort = { attendanceDate: 1 };
        } else {
            sort = { attendanceDate: -1 };
        };

        // Calculate total count
        const totalCount = await Attendance.countDocuments(query);

        // Fetch attendance with the constructed query
        const attendance = await Attendance.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('employee', 'name')
            .exec();

        if (!attendance) {
            return res.status(404).json({ success: false, message: 'Attendance not found' });
        };

        return res.status(200).json({ success: true, attendance, totalCount });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: error.message });
    };
};

// Get a single attendance record by ID
export const fetchSingleAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id).populate('employee', 'name');

        if (!attendance) {
            return res.status(404).json({ success: false, message: 'Attendance not found' });
        };

        return res.status(200).json({ success: true, attendance });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: error.message });
    };
};

// Helper function to convert time (HH:MM) into minutes
function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

// Helper function to convert minutes into time (HH:MM)
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

// Fetch monthly statistic
export const fetchMonthlyStatistic = async (req, res) => {
    try {
        const { employeeId, month } = req.query;

        if (!employeeId || !month) {
            return res.status(400).json({ success: false, message: "Employee ID and month in YYYY-MM format are required." });
        };

        // Fetch attendance records for the specified employee and month
        const attendanceRecords = await Attendance.find({
            employee: employeeId,
            attendanceDate: { $regex: `^${month}-` }, // Matches month in "YYYY-MM" format
        });

        if (!attendanceRecords) {
            return res.status(400).json({ success: false, message: "Attendance not found" });
        };

        // Initialize counters
        let totalPresent = 0;
        let totalAbsent = 0;
        let totalLeave = 0;
        let totalHolidays = 0;
        let totalSundays = 0;
        let totalMinutesWorked = 0;
        let totalLateIn = 0;

        // Variables to calculate punch-in and punch-out averages
        let totalPunchInMinutes = 0;
        let punchInCount = 0;
        let totalPunchOutMinutes = 0;
        let punchOutCount = 0;

        // Iterate over attendance records to calculate statistics
        attendanceRecords.forEach((record) => {
            if (record.status === "Present") {
                totalPresent++;
                if (record.hoursWorked) {
                    totalMinutesWorked += timeToMinutes(record.hoursWorked);
                };
                if (record.lateIn !== "00:00") {
                    totalLateIn++;
                };
                if (record.punchInTime) {
                    totalPunchInMinutes += timeToMinutes(record.punchInTime);
                    punchInCount++;
                };
                if (record.punchOutTime) {
                    totalPunchOutMinutes += timeToMinutes(record.punchOutTime);
                    punchOutCount++;
                };
            } else if (record.status === "Absent") {
                totalAbsent++;
            } else if (record.status === "On Leave") {
                totalLeave++;
            } else if (record.status === "Holiday") {
                totalHolidays++;
            } else if (record.status === "Sunday") {
                totalSundays++;
            };
        });

        // Calculate average punch-in and punch-out times
        const averagePunchInTime = punchInCount
            ? minutesToTime(Math.floor(totalPunchInMinutes / punchInCount))
            : null;

        const averagePunchOutTime = punchOutCount
            ? minutesToTime(Math.floor(totalPunchOutMinutes / punchOutCount))
            : null;

        // Calculate total days in the month
        const [year, monthIndex] = month.split("-").map(Number);
        const daysInMonth = new Date(year, monthIndex, 0).getDate();

        const totalWorkingDays = totalPresent + totalAbsent;

        const employee = await Team.findById(employeeId);

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found." });
        };

        const [requiredHours, requiredMinutes] = employee.workingHoursPerDay.split(":").map(Number);
        const dailyThreshold = requiredHours * 60 + requiredMinutes;

        const totalWorkingHours = minutesToTime(totalWorkingDays * dailyThreshold);
        const requiredWorkingHours = minutesToTime(totalPresent * dailyThreshold);
        const totalHoursWorked = minutesToTime(totalMinutesWorked);

        // Prepare the response
        const attendance = {
            employee: employeeId,
            month,
            totalDaysInMonth: daysInMonth,
            companyWorkingDays: totalWorkingDays,
            companyWorkingHours: totalWorkingHours,
            totalHolidays,
            totalSundays,
            employeePresentDays: totalPresent,
            employeeAbsentDays: totalAbsent,
            employeeLeaveDays: totalLeave,
            employeeWorkingHours: totalHoursWorked,
            employeeRequiredWorkingHours: requiredWorkingHours,
            employeeLateInDays: totalLateIn,
            averagePunchInTime,
            averagePunchOutTime,
        };

        return res.status(200).json({ success: true, attendance });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, error: error.message });
    };
};

// Update attendance with punch-out
export const updateAttendance = async (req, res) => {
    try {
        const { employee, attendanceDate, punchOutTime } = req.body;

        if (!employee || !attendanceDate || !punchOutTime) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        };

        // Find punch in record
        const attendance = await Attendance.findOne({
            employee,
            attendanceDate,
            punchIn: true,
        });

        if (!attendance) {
            return res.status(400).json({ success: false, message: "Punch in not found for today" });
        };

        // Update punch-out details
        const updatedAttendance = await Attendance.findOneAndUpdate(
            { _id: attendance._id },
            {
                $set: {
                    punchOutTime,
                    punchOut: true,
                    hoursWorked: calculateTimeDifference(attendance.punchInTime, punchOutTime),
                },
            },
            { new: true },
        );

        return res.status(200).json({ success: true, attendance: updatedAttendance });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    };
};

// Delete an attendance record by ID
export const deleteAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndDelete(req.params.id);

        if (!attendance) {
            return res.status(404).json({ success: false, message: 'Attendance not found' });
        };

        return res.status(204).json({ success: true });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: error.message });
    };
};
