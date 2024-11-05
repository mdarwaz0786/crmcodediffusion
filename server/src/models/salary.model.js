import mongoose from "mongoose";

const salarySchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
        },
        month: {
            type: String,
            required: true,
        },
        employeeWorkingHours: {
            type: String,
            default: "00:00",
        },
        companyWorkingHours: {
            type: String,
            default: "00:00",
        },
        companyWorkingDays: {
            type: Number,
            default: 0,
        },
        totalSalary: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
);

// Helper function to convert "HH:MM" format to total minutes
function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

// Helper function to convert total minutes to "HH:MM" format
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

// Middleware to calculate total salary with deductions
salarySchema.pre("save", async function (next) {
    try {
        const Team = mongoose.model("Team");
        const Attendance = mongoose.model("Attendance");

        // Fetch employee details including salary and required hours
        const employee = await Team.findById(this.employee);
        const monthlySalary = parseFloat(employee.monthlySalary);
        const [requiredHours, requiredMinutes] = employee.workingHoursPerDay.split(":").map(Number);
        const dailyThreshold = requiredHours * 60 + requiredMinutes; // Convert required hours to minutes

        // Fetch attendance records for Sundays and Holidays in the specified month
        const sundayHolidayRecords = await Attendance.find({
            employee: this.employee,
            attendanceDate: { $regex: `^${this.month}-` }, // Matches records in "YYYY-MM" format
            status: { $in: ["Sunday", "Holiday"] },
        });

        // Calculate total Sundays and Holidays
        const totalSundaysAndHolidays = sundayHolidayRecords.length;

        // Calculate total days in the month
        const daysInMonth = new Date(this.month.split("-")[0], this.month.split("-")[1], 0).getDate();
        const companyWorkingDays = daysInMonth - totalSundaysAndHolidays;

        // Calculate total company working hours for the month in minutes and convert to "HH:MM"
        const totalCompanyMinutes = companyWorkingDays * dailyThreshold;
        this.companyWorkingHours = minutesToTime(totalCompanyMinutes);
        this.companyWorkingDays = companyWorkingDays;

        // Fetch attendance records for Present days to calculate total hours worked in the month
        const attendanceRecords = await Attendance.find({
            employee: this.employee,
            attendanceDate: { $regex: `^${this.month}-` }, // Matches records in "YYYY-MM" format
            status: "Present",
        });

        // Calculate total employee working hours for the month in minutes
        let totalMinutesWorked = 0;
        attendanceRecords.forEach((record) => {
            if (record.hoursWorked) {
                totalMinutesWorked += timeToMinutes(record.hoursWorked);
            };
        });

        // Convert total minutes worked to "HH:MM" format for storage
        this.employeeWorkingHours = minutesToTime(totalMinutesWorked);

        // Calculate deduction days based on hours shortfall
        const hoursShortfall = totalCompanyMinutes - totalMinutesWorked;
        const deductionDays = hoursShortfall > 0 ? Math.ceil(hoursShortfall / dailyThreshold) : 0;

        // Calculate daily salary based on total company working days
        const dailySalary = monthlySalary / companyWorkingDays;

        // Calculate total salary after deductions
        this.totalSalary = (companyWorkingDays - deductionDays) * dailySalary;

        next();

    } catch (error) {
        next(error);
    };
});

export default mongoose.model("Salary", salarySchema);
