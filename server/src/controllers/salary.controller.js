import Team from "../models/team.model.js";
import Attendance from "../models/attendance.model.js";
import Salary from "../models/salary.model.js";
import Holiday from "../models/holiday.model.js";

// Helper function to convert time (HH:MM) into minutes
function timeToMinutes(time) {
    if (!time) {
        return;
    };

    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

// Helper function to convert minutes into time (HH:MM)
function minutesToTime(minutes) {
    if (!minutes) {
        return;
    };

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

// Function to convert UTC date to IST
const convertToIST = (date) => {
    if (!date) {
        return;
    };

    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    return new Date(date.getTime() + IST_OFFSET);
};

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

// Fetch monthly salary for employee
export const fetchMonthlySalary = async (req, res) => {
    try {
        const { month } = req.query;

        if (!month) {
            return res.status(400).json({ success: false, message: "Month in YYYY-MM format is required." });
        };

        const employees = await Team.find();

        if (!employees || employees?.length === 0) {
            return res.status(400).json({ success: false, message: "Employees not found." });
        };

        const salaryData = await Promise.all(
            employees?.map(async (employee) => {
                const monthlySalary = parseFloat(employee?.monthlySalary);
                const [requiredHours, requiredMinutes] = employee?.workingHoursPerDay?.split(":")?.map(Number);
                const dailyThreshold = requiredHours * 60 + requiredMinutes;

                // Calculate the start and end dates for the month
                const [year, monthIndex] = month.split("-").map(Number);
                let startDate = new Date(year, monthIndex - 1, 1);
                let endDate = new Date(year, monthIndex, 0);

                // Convert start and end dates to IST
                startDate = convertToIST(startDate);
                endDate = convertToIST(endDate);

                // Fetch Sunday, Holiday and Comp Off records
                const sundayHolidayCompOffRecords = await Attendance.find({
                    employee: employee?._id,
                    attendanceDate: { $gte: startDate?.toISOString()?.split("T")[0], $lte: endDate?.toISOString()?.split("T")[0] },
                    status: { $in: ["Sunday", "Holiday", "Comp Off"] },
                });

                const totalSundaysHolidayCompoff = sundayHolidayCompOffRecords?.length;

                const daysInMonth = new Date(year, monthIndex, 0).getDate();
                const companyWorkingDays = daysInMonth - totalSundaysHolidayCompoff;

                const totalCompanyWorkingMinutes = companyWorkingDays * dailyThreshold;

                // Fetch attendance records
                const attendanceRecords = await Attendance.find({
                    employee: employee?._id,
                    attendanceDate: { $gte: startDate?.toISOString()?.split("T")[0], $lte: endDate?.toISOString()?.split("T")[0] },
                });

                let totalMinutesWorked = 0;
                let onLeave = 0;
                let compOff = 0;

                attendanceRecords.forEach((record) => {
                    if (record?.status === "Present" || record?.status === "Half Day") {
                        totalMinutesWorked += timeToMinutes(record?.hoursWorked);
                    };

                    if (record?.status === "On Leave") {
                        onLeave += 1;
                    };

                    if (record?.status === "Comp Off") {
                        compOff += 1;
                    };
                });

                // Calculate deduction days
                const hoursShortfall = totalCompanyWorkingMinutes - totalMinutesWorked;
                const deductionDays = hoursShortfall > 0 ? (hoursShortfall / dailyThreshold) : 0;
                const totalDeductionDays = deductionDays - onLeave - compOff;

                // Calculate total salary
                const dailySalary = monthlySalary / companyWorkingDays;
                const totalSalary = (companyWorkingDays - totalDeductionDays) * dailySalary;

                // Calculate total deduction
                const totalDeduction = monthlySalary - totalSalary;

                // Check if salary has been paid
                const salaryRecord = await Salary.findOne({
                    employee: employee?._id,
                    month: monthIndex < 10 ? (`0${monthIndex}`)?.toString() : monthIndex?.toString(),
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

// New fetch monthly salary for employee
export const newFetchMonthlySalary = async (req, res) => {
    try {
        const { month } = req.query;

        if (!month) {
            return res.status(400).json({ success: false, message: "Month in YYYY-MM format is required." });
        };

        const employees = await Team
            .find()
            .select("workingHoursPerDay approvedLeaves eligibleCompOffDate monthlySalary name");

        if (!employees || employees?.length === 0) {
            return res.status(400).json({ success: false, message: "Employees not found." });
        };

        const salaryData = await Promise.all(
            employees?.map(async (employee) => {
                let [requiredHours, requiredMinutes] = employee?.workingHoursPerDay?.split(":")?.map(Number);
                let dailyThreshold = requiredHours * 60 + requiredMinutes;
                let monthlySalary = employee?.monthlySalary;

                let [year, monthIndex] = month?.split("-")?.map(Number);
                let totalDaysInMonth = new Date(year, monthIndex, 0).getDate();

                let totalPresent = 0;
                let totalHalfDays = 0;
                let totalAbsent = 0;
                let totalCompOff = 0;
                let totalOnLeave = 0;
                let totalHolidays = 0;
                let totalSundays = 0;
                let totalMinutesWorked = 0;

                for (let day = 1; day <= totalDaysInMonth; day++) {
                    let date = new Date(year, monthIndex - 1, day);
                    let formattedDate = convertToIST(date).toISOString().split("T")[0];
                    let currentDate = convertToIST(new Date()).toISOString().split("T")[0];

                    if (formattedDate > currentDate) {
                    } else if (date.getDay() === 0) {
                        let attendanceRecord = await Attendance.findOne({
                            employee: employee?._id,
                            attendanceDate: formattedDate,
                            status: { $in: ["Present", "Half Day"] },
                        }).select("hoursWorked status");
                        if (attendanceRecord) {
                            if (attendanceRecord?.status === "Present") {
                                totalPresent++
                            };
                            if (attendanceRecord?.status === "Half Day") {
                                totalHalfDays++;
                            };
                            if (attendanceRecord?.hoursWorked) {
                                totalMinutesWorked += timeToMinutes(attendanceRecord?.hoursWorked);
                            };
                        } else {
                            totalSundays++;
                        };
                    } else {
                        let holiday = await Holiday.findOne({ date: formattedDate });
                        let leaveRecord = employee?.approvedLeaves?.some((leave) => leave?.date === formattedDate);
                        let compOffRecord = employee?.eligibleCompOffDate?.some((comp) => comp?.compOffDate === formattedDate);
                        if (holiday) {
                            let attendanceRecord = await Attendance.findOne({
                                employee: employee?._id,
                                attendanceDate: formattedDate,
                                status: { $in: ["Present", "Half Day"] },
                            }).select("hoursWorked status");
                            if (attendanceRecord) {
                                if (attendanceRecord?.status === "Present") {
                                    totalPresent++
                                };
                                if (attendanceRecord?.status === "Half Day") {
                                    totalHalfDays++;
                                };
                                if (attendanceRecord?.hoursWorked) {
                                    totalMinutesWorked += timeToMinutes(attendanceRecord?.hoursWorked);
                                };
                            } else {
                                totalHolidays++;;
                            };
                        } else if (compOffRecord) {
                            totalCompOff++;
                        } else if (leaveRecord) {
                            totalOnLeave++;
                        } else {
                            let attendanceRecord = await Attendance.findOne({
                                employee: employee?._id,
                                attendanceDate: formattedDate,
                                status: { $in: ["Present", "Half Day"] },
                            }).select("hoursWorked status");
                            if (attendanceRecord) {
                                if (attendanceRecord?.status === "Present") {
                                    totalPresent++;
                                };
                                if (attendanceRecord?.status === "Half Day") {
                                    totalHalfDays++;
                                };
                                if (attendanceRecord?.hoursWorked) {
                                    totalMinutesWorked += timeToMinutes(attendanceRecord?.hoursWorked);
                                };
                            } else {
                                totalAbsent++;
                            };
                        };
                    };
                };

                // let companyWorkingDays = totalDaysInMonth - (totalHolidays + totalSundays);
                // let companyWorkingMinutes = companyWorkingDays * dailyThreshold;
                // // Calculate deduction days
                // let minutesShortfall = companyWorkingMinutes - totalMinutesWorked;
                // let deductionDays = minutesShortfall > 0 ? Math.ceil(minutesShortfall / dailyThreshold) : 0;
                // // Calculate total salary
                // let dailySalary = monthlySalary / companyWorkingDays;
                // let totalSalary = (companyWorkingDays - deductionDays + totalOnLeave + totalCompOff) * dailySalary;

                let companyWorkingMinutes = (totalDaysInMonth - (totalHolidays + totalSundays)) * dailyThreshold;

                let minutesShortfall = companyWorkingMinutes - totalMinutesWorked;
                let deductionDays = minutesShortfall > 0 ? Math.ceil(minutesShortfall / dailyThreshold) : 0;

                let dailySalary = monthlySalary / totalDaysInMonth;
                let totalDeduction = deductionDays * dailySalary;
                let totalSalary = monthlySalary - totalDeduction;

                let totalLeaveAndCompOff = totalOnLeave + totalCompOff;
                let salaryOfLeaveAndCompOff;

                if (totalLeaveAndCompOff > 0) {
                    salaryOfLeaveAndCompOff = dailySalary * totalLeaveAndCompOff;
                    totalSalary = totalSalary + salaryOfLeaveAndCompOff;
                };

                // Check if salary has been paid or not
                let salaryRecord = await Salary.findOne({
                    employee: employee?._id,
                    month: monthIndex < 10 ? (`0${monthIndex}`)?.toString() : monthIndex?.toString(),
                    year: year.toString(),
                });

                let salaryPaid = salaryRecord ? salaryRecord?.salaryPaid : false;
                let transactionId = salaryRecord ? salaryRecord?.transactionId : "";

                return {
                    employeeId: employee?._id,
                    employeeName: employee?.name,
                    monthlySalary,
                    totalSalary: totalSalary.toFixed(2),
                    totalDeduction: totalDeduction.toFixed(2),
                    dailySalary: dailySalary.toFixed(2),
                    salaryPaid,
                    transactionId,
                    companyWorkingHours: minutesToTime(companyWorkingMinutes),
                    employeeHoursWorked: minutesToTime(totalMinutesWorked),
                    employeeHoursShortfall: minutesToTime(minutesShortfall),
                    deductionDays,
                    totalPresent,
                    totalHalfDays,
                    totalAbsent,
                    totalCompOff,
                    totalOnLeave,
                    totalHolidays,
                    totalSundays,
                };
            }),
        );

        return res.status(200).json({ success: true, salaryData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    };
};
