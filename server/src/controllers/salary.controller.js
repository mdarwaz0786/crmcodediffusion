import Team from "../models/team.model.js";
import Attendance from "../models/attendance.model.js";
import Salary from "../models/salary.model.js";

// Create a new salary record
export const createSalary = async (req, res) => {
    try {
        const { employee, month, year, salaryPaid, amountPaid } = req.body;

        const newSalary = new Salary({
            employee,
            month,
            year,
            salaryPaid,
            amountPaid,
        });

        await newSalary.save();
        res.status(201).json({ success: true, data: newSalary });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    };
};

// Get all salary records (with sorting and pagination)
export const getAllSalaries = async (req, res) => {
    try {
        const query = {};

        // Filtering logic
        if (req.query.employee) {
            query.employee = req.query.employee;
        };

        if (req.query.month) {
            query.month = req.query.month;
        };

        if (req.query.year) {
            query.year = req.query.year;
        };

        // Sorting logic
        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sort = { [sortField]: sortOrder };

        // Pagination logic
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;

        // Fetching data with sorting, pagination, and population
        const salaries = await Salary.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate("employee")
            .exec();

        // Counting total records
        const total = await Salary.countDocuments(query);

        res.status(200).json({
            success: true,
            data: salaries,
            totalCount: total,
            currentPage: page,
            pageLimit: limit,
            totalPages: Math.ceil(totalCount / limit)
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    };
};

// Get a single salary record by ID
export const getSalaryById = async (req, res) => {
    try {
        const salary = await Salary.findById(req.params.id).populate("employee");
        if (!salary) {
            return res.status(404).json({ success: false, message: "Salary record not found." });
        };
        res.status(200).json({ success: true, data: salary });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    };
};

// Update a salary record by ID
export const updateSalary = async (req, res) => {
    try {
        const updatedSalary = await Salary.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedSalary) {
            return res.status(404).json({ success: false, message: "Salary not found." });
        };

        res.status(200).json({ success: true, data: updatedSalary });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    };
};

// Delete a salary record by ID
export const deleteSalary = async (req, res) => {
    try {
        const deletedSalary = await Salary.findByIdAndDelete(req.params.id);

        if (!deletedSalary) {
            return res.status(404).json({ success: false, message: "Salary record not found." });
        };

        res.status(200).json({ success: true, message: "Salary record deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    };
};

// Helper function to convert time (HH:MM) into minutes
function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

// Fetch monthly salary for employee
export const fetchMonthlySalary = async (req, res) => {
    try {
        const { employeeId, month } = req.query;

        if (!employeeId || !month) {
            return res.status(400).json({ message: "Employee ID and month (YYYY-MM) are required." });
        };

        const employee = await Team.findById(employeeId);

        if (!employee) {
            return res.status(404).json({ message: "Employee not found." });
        };

        const monthlySalary = parseFloat(employee.monthlySalary);
        const [requiredHours, requiredMinutes] = employee.workingHoursPerDay.split(":").map(Number);
        const dailyThreshold = requiredHours * 60 + requiredMinutes;

        // Fetch Sunday and Holiday records
        const sundayHolidayRecords = await Attendance.find({
            employee: employeeId,
            attendanceDate: { $regex: `^${month}-` },
            status: { $in: ["Sunday", "Holiday"] },
        });

        const totalSundaysAndHolidays = sundayHolidayRecords.length;

        // Total days in the month
        const [year, monthIndex] = month.split("-").map(Number);
        const daysInMonth = new Date(year, monthIndex, 0).getDate();
        const companyWorkingDays = daysInMonth - totalSundaysAndHolidays;

        const totalCompanyMinutes = companyWorkingDays * dailyThreshold;

        // Fetch attendance records
        const attendanceRecords = await Attendance.find({
            employee: employeeId,
            attendanceDate: { $regex: `^${month}-` },
        });

        let totalMinutesWorked = 0;
        let absentDays = 0;

        attendanceRecords.forEach((record) => {
            if (record.status === "Present") {
                totalMinutesWorked += timeToMinutes(record.hoursWorked);
            } else if (record.status === "Absent") {
                absentDays += 1;
            };
        });

        // Deduction calculations
        const effectiveAbsentDays = Math.min(2, Math.max(0, absentDays)); // Allow up to 2 absent days without salary deduction
        const hoursShortfall = totalCompanyMinutes - totalMinutesWorked;
        const additionalDeductionDays = hoursShortfall > 0 ? (hoursShortfall / dailyThreshold) : 0;

        const totalDeductionDays = additionalDeductionDays - effectiveAbsentDays;

        // Calculate salary
        const dailySalary = monthlySalary / companyWorkingDays;
        const totalSalary = (companyWorkingDays - totalDeductionDays) * dailySalary;

        // Calculate total deduction
        const totalDeduction = monthlySalary - totalSalary;

        // Response data
        const salary = {
            employee: employeeId,
            month,
            monthlySalary,
            totalSalary: totalSalary.toFixed(2),
            totalDeduction: totalDeduction.toFixed(2),
        };

        return res.status(200).json({ success: true, salary });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, error: error.message });
    };
};
