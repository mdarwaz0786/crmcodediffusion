import Team from "../models/team.model.js";
import Attendance from "../models/attendance.model.js";

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
            if (record.status === "Present" && record.hoursWorked) {
                totalMinutesWorked += timeToMinutes(record.hoursWorked);
            } else if (record.status === "Absent") {
                absentDays += 1;
            };
        });

        // Deduction calculations
        const effectiveAbsentDays = Math.max(0, absentDays - 2); // Allow up to 2 absent days without salary deduction
        const hoursShortfall = totalCompanyMinutes - totalMinutesWorked;
        const additionalDeductionDays = hoursShortfall > 0 ? Math.ceil(hoursShortfall / dailyThreshold) : 0;

        const totalDeductionDays = effectiveAbsentDays + additionalDeductionDays;

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
