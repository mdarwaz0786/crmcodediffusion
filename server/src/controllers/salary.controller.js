import Team from "../models/team.model.js";
import Attendance from "../models/attendance.model.js";

// Helper function to convert time into minutes
function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

// Helper function to convert minutes into time
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
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
        const companyWorkingHours = minutesToTime(totalCompanyMinutes);

        // Fetch attendance records for Present days
        const attendanceRecords = await Attendance.find({
            employee: employeeId,
            attendanceDate: { $regex: `^${month}-` },
            status: "Present",
        });

        let totalMinutesWorked = 0;

        attendanceRecords.forEach((record) => {
            if (record.hoursWorked) {
                totalMinutesWorked += timeToMinutes(record.hoursWorked);
            };
        });

        const employeeWorkingHours = minutesToTime(totalMinutesWorked);
        const employeeWorkingDays = attendanceRecords.length;

        // Deduction calculations
        const hoursShortfall = totalCompanyMinutes - totalMinutesWorked;
        const deductionDays = hoursShortfall > 0 ? Math.ceil(hoursShortfall / dailyThreshold) : 0;

        const dailySalary = monthlySalary / companyWorkingDays;
        const totalSalary = (companyWorkingDays - deductionDays) * dailySalary;

        // Response data
        const salary = {
            employee: employeeId,
            month,
            companyWorkingDays,
            companyWorkingHours,
            employeeWorkingDays,
            employeeWorkingHours,
            totalSalary: totalSalary.toFixed(2),
        };

        return res.status(200).json({ success: true, salary });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, error: error.message });
    };
};
