import Attendance from '../models/attendance.model.js';

// Create a new attendance record
export const createAttendance = async (req, res) => {
    try {
        const attendance = new Attendance(req.body);
        await attendance.save();
        res.status(201).json(attendance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    };
};

// Fetch all attendance records
export const fetchAllAttendance = async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find().populate('employee');
        res.status(200).json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    };
};

// Get a single attendance record by ID
export const fetchSingleAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id).populate('employee', 'name');
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }
        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    };
};

// Update an attendance record by ID
export const updateAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        };
        res.status(200).json(attendance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    };
};

// Delete an attendance record by ID
export const deleteAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndDelete(req.params.id);
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        };
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    };
};
