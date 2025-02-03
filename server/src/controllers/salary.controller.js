import Team from "../models/team.model.js";
import Attendance from "../models/attendance.model.js";
import Salary from "../models/salary.model.js";

// Create a new salary record
export const createSalary = async (req, res) => {
    try {
        const { employee, month, year, salaryPaid, amountPaid, transactionId } = req.body;

        if (!transactionId || !employee || !month || !year || !salaryPaid || !amountPaid) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        };

        // Check if a salary record already exists for this employee, month, and year
        const existingSalary = await Salary.findOne({ employee, month, year });

        if (existingSalary) {
            return res.status(400).json({ success: false, message: "Salary already paid." });
        };

        // Create a new salary record
        const newSalary = new Salary({
            employee,
            month,
            year,
            salaryPaid,
            amountPaid,
            transactionId,
        });

        await newSalary.save();

        return res.status(201).json({ success: true, data: newSalary });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    };
};

// Get all salary records (with sorting and pagination)
export const getAllSalaries = async (req, res) => {
    try {
        let query = {};
        let sort = {};

        // Filtering logic
        if (req.query.employeeId) {
            query.employee = req.query.employeeId;
        };

        if (req.query.month) {
            query.month = req.query.month;
        };

        if (req.query.year) {
            query.year = req.query.year;
        };

        // Sorting logic
        if (req.query.sort === 'Ascending') {
            sort = { createdAt: 1 };
        } else {
            sort = { createdAt: -1 };
        };

        // Pagination logic
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;

        // Fetching data with sorting, pagination, and population
        const salaries = await Salary
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate("employee")
            .exec();

        // Counting total records
        const total = await Salary.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: salaries,
            totalCount: total,
            currentPage: page,
            pageLimit: limit,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    };
};

// Get a single salary record by ID
export const getSalaryById = async (req, res) => {
    try {
        const salary = await Salary
            .findById(req.params.id)
            .populate("employee")
            .exec();

        if (!salary) {
            return res.status(404).json({ success: false, message: "Salary record not found." });
        };

        return res.status(200).json({ success: true, data: salary });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    };
};

// Update a salary record by ID
export const updateSalary = async (req, res) => {
    try {
        const updatedSalary = await Salary.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!updatedSalary) {
            return res.status(404).json({ success: false, message: "Salary record not found." });
        };

        return res.status(200).json({ success: true, data: updatedSalary });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
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
    if (time === "") return;
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

// Fetch monthly salary for employee
export const fetchMonthlySalary = async (req, res) => {
    try {
        const { month } = req.query;

        if (!month) {
            return res.status(400).json({ message: "Month (yyyy-mm) is required." });
        };

        // Fetch all active employees
        const employees = await Team.find();

        const salaryData = await Promise.all(
            employees?.map(async (employee) => {
                const monthlySalary = parseFloat(employee?.monthlySalary);
                const [requiredHours, requiredMinutes] = employee?.workingHoursPerDay?.split(":").map(Number);
                const dailyThreshold = requiredHours * 60 + requiredMinutes;

                // Calculate the start and end dates for the month
                const [year, monthIndex] = month.split("-").map(Number);
                const startDate = new Date(year, monthIndex - 1, 1);
                const endDate = new Date(year, monthIndex, 0);

                // Fetch Sunday and Holiday records
                const sundayHolidayRecords = await Attendance.find({
                    employee: employee?._id,
                    attendanceDate: { $gte: startDate.toISOString().split("T")[0], $lte: endDate.toISOString().split("T")[0] },
                    status: { $in: ["Sunday", "Holiday"] },
                });

                const totalSundaysAndHolidays = sundayHolidayRecords.length;

                const daysInMonth = new Date(year, monthIndex, 0).getDate();
                const companyWorkingDays = daysInMonth - totalSundaysAndHolidays;

                const totalCompanyWorkingMinutes = companyWorkingDays * dailyThreshold;

                // Fetch attendance records
                const attendanceRecords = await Attendance.find({
                    employee: employee?._id,
                    attendanceDate: { $gte: startDate.toISOString().split("T")[0], $lte: endDate.toISOString().split("T")[0] },
                });

                let totalMinutesWorked = 0;
                let onLeave = 0;

                attendanceRecords.forEach((record) => {
                    if (record?.status === "Present" || record?.status === "Half Day") {
                        totalMinutesWorked += timeToMinutes(record?.hoursWorked);
                    };

                    if (record?.status === "On Leave") {
                        onLeave += 1;
                    };
                });

                // Calculate deduction days
                const hoursShortfall = totalCompanyWorkingMinutes - totalMinutesWorked;
                const deductionDays = hoursShortfall > 0 ? Math.ceil(hoursShortfall / dailyThreshold) : 0;
                const totalDeductionDays = deductionDays - onLeave;

                // Calculate total salary
                const dailySalary = monthlySalary / companyWorkingDays;
                const totalSalary = (companyWorkingDays - totalDeductionDays) * dailySalary;

                // Calculate total deduction
                const totalDeduction = monthlySalary - totalSalary;

                // Check if salary has been paid
                const salaryRecord = await Salary.findOne({
                    employee: employee?._id,
                    month: monthIndex.toString(),
                    year: year.toString(),
                });

                const salaryPaid = salaryRecord ? salaryRecord?.salaryPaid : false;
                const transactionId = salaryRecord ? salaryRecord?.transactionId : "";

                return {
                    employeeId: employee?._id,
                    employeeName: employee?.name,
                    monthlySalary,
                    totalSalary: totalSalary.toFixed(2),
                    totalDeduction: totalDeduction.toFixed(2),
                    salaryPaid,
                    transactionId,
                };
            }),
        );

        return res.status(200).json({ success: true, salaryData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    };
};
