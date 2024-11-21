import Attendance from '../models/attendance.model.js';
import Team from "../models/team.model.js";
import mongoose from 'mongoose';

// Helper function to calculate hours difference
function calculateHoursDifference(punchInTime, punchOutTime) {
    const [inHours, inMinutes] = punchInTime.split(":").map(Number);
    const [outHours, outMinutes] = punchOutTime.split(":").map(Number);

    const inTotalMinutes = inHours * 60 + inMinutes;
    const outTotalMinutes = outHours * 60 + outMinutes;
    const totalMinutesWorked = Math.max(outTotalMinutes - inTotalMinutes, 0);

    const hours = Math.floor(totalMinutesWorked / 60);
    const minutes = totalMinutesWorked % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// Create a new attendance record
export const createAttendance = async (req, res) => {
    try {
        const { employee, attendanceDate, punchInTime } = req.body;

        const existingAttendance = await Attendance.findOne({ employee, attendanceDate, punchIn: true });

        if (existingAttendance) {
            return res.status(400).json({ success: false, message: 'Already punched in' });
        };

        const attendance = new Attendance({
            employee,
            attendanceDate,
            status: "Present",
            punchInTime,
            punchIn: true,
            punchOutTime: "",
            punchOut: false,
            hoursWorked: "00:00",
            lateIn: calculateHoursDifference("10:00", punchInTime),
        });

        await attendance.save();
        return res.status(201).json({ success: true, attendance });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: error.message });
    };
};

// Get all attendance
export const fetchAllAttendance = async (req, res) => {
    try {
        const { date, employeeId } = req.query;
        const query = {};

        // Filter by exact date if provided
        if (date) {
            query.attendanceDate = date;
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

        // Fetch attendance with the constructed query
        const attendance = await Attendance.find(query).populate('employee').exec();

        if (!attendance) {
            return res.status(404).json({ success: false, message: 'Attendance not found' });
        };

        return res.status(200).json({ success: true, attendance });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: error.message });
    };
};

// Get a single attendance record by ID
export const fetchSingleAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id).populate('employee');

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

        const totalWorkingDays = daysInMonth - (totalHolidays + totalSundays);

        const employee = await Team.findById(employeeId);

        if (!employee) {
            return res.status(404).json({ message: "Employee not found." });
        };

        const [requiredHours, requiredMinutes] = employee.workingHoursPerDay.split(":").map(Number);
        const dailyThreshold = requiredHours * 60 + requiredMinutes;

        const totalWorkingHours = minutesToTime(totalWorkingDays * dailyThreshold);

        // Convert total minutes worked to "HH:MM" format
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

// Update an attendance record by ID
export const updateAttendance = async (req, res) => {
    try {
        const { employee, attendanceDate, punchOutTime } = req.body;

        const existingAttendance = await Attendance.findOne({ employee, attendanceDate, punchOut: true });

        if (existingAttendance) {
            return res.status(400).json({ success: false, message: 'Already punched out' });
        };

        const attendance = await Attendance.findOne({ employee, attendanceDate, punchOut: false });

        if (!attendance) {
            return res.status(404).json({ success: false, message: 'Attendance not found' });
        };

        if (punchOutTime) {
            attendance.punchOutTime = punchOutTime;
            attendance.punchOut = true;
            attendance.hoursWorked = calculateHoursDifference(attendance.punchInTime, punchOutTime);
        };

        await attendance.save();

        return res.status(200).json({ success: true, attendance });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: error.message });
    };
};

// Delete an attendance record by ID
export const deleteAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndDelete(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance not found' });
        };

        return res.status(204).json({ success: true });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: error.message });
    };
};
