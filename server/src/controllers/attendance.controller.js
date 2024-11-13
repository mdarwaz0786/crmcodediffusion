import Attendance from '../models/attendance.model.js';
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
            status: "Absent",
            punchInTime,
            punchIn: true,
            punchOutTime: "",
            punchOut: false,
            hoursWorked: "",
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
            attendance.status = "Present";
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
