import Team from "../models/team.model.js";
import Attendance from "../models/attendance.model.js";
import Salary from "../models/salary.model.js";
import Holiday from "../models/holiday.model.js";
import puppeteer from "puppeteer";
import { transporter } from "../services/emailService.js";
import fs from "fs";
import path from "path";

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
    if (typeof minutes !== "number") {
        minutes = Number(minutes);
        if (isNaN(minutes)) return "Invalid input";
    };

    const isNegative = minutes < 0;
    minutes = Math.abs(minutes);

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    const formattedTime = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    return isNegative ? `+${formattedTime}` : formattedTime;
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

        if (!transactionId) {
            return res.status(400).json({ success: false, message: "Transaction id is required." });
        };

        // Check if a salary record already exists
        const existingSalary = await Salary.findOne({ employee, month, year });

        if (existingSalary) {
            return res.status(400).json({ success: false, message: "Salary already paid." });
        };

        if (!employee || !month || !year) {
            return res.status(400).json({ success: false, message: "Employee ID, Month (YYYY-MM), and Year are required." });
        };

        // Fetch the specific employee data by employeeId
        const emp = await Team
            .findById(employee)
            .select("workingHoursPerDay approvedLeaves eligibleCompOffDate monthlySalary name");

        if (!emp) {
            return res.status(400).json({ success: false, message: "Employee not found." });
        };

        let [requiredHours, requiredMinutes] = emp?.workingHoursPerDay?.split(":")?.map(Number);
        let dailyThreshold = requiredHours * 60 + requiredMinutes;
        let monthlySalary = emp?.monthlySalary;

        let [yearParsed, monthIndex] = month?.split("-")?.map(Number);
        let totalDaysInMonth = new Date(yearParsed, monthIndex, 0).getDate();

        let totalPresent = 0;
        let totalHalfDays = 0;
        let totalAbsent = 0;
        let totalCompOff = 0;
        let totalOnLeave = 0;
        let totalHolidays = 0;
        let totalSundays = 0;
        let totalMinutesWorked = 0;

        for (let day = 1; day <= totalDaysInMonth; day++) {
            let date = new Date(yearParsed, monthIndex - 1, day);
            let formattedDate = convertToIST(date).toISOString().split("T")[0];
            let currentDate = convertToIST(new Date()).toISOString().split("T")[0];

            if (formattedDate > currentDate) {
                // Skip future dates
            } else if (date.getDay() === 0) { // Sunday
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

        const salaryData = {
            employeeId: emp?._id,
            employeeName: emp?.name,
            monthlySalary,
            totalSalary: totalSalary.toFixed(2),
            totalDeduction: totalDeduction.toFixed(2),
            dailySalary: dailySalary.toFixed(2),
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

        console.log(salaryData);

        // Read the logo file and convert it to Base64
        const __dirname = path.resolve();
        const logoPath = path.join(__dirname, 'public/assets/logo.png');
        const logoBase64 = fs.readFileSync(logoPath).toString('base64');
        const logoSrc = `data:image/png;base64,${logoBase64}`;

        // Generate the salary slip HTML
        const salarySlipHTML = `
   <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Salary Slip</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
    }

    .page-wrapper {
      margin: 20px;
    }

    .content {
      background-color: #fff;
      padding: 20px;
      border-radius: 5px;
    }

    .salary-slip {
      padding: 20px;
      background-color: white;
    }

    .logo-section {
      margin-bottom: 30px;
    }

    .logo {
      width: 150px;
      height: 30px;
    }

    .company-details {
      margin-bottom: 20px;
    }

    .company-name {
      font-weight: 600;
      font-size: 20px;
      margin-bottom: 15px;
    }

    .salary-title {
      margin-top: 50px;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
    }

    .payment-title,
    .attendance-summary-title {
      margin-top: 50px;
      font-size: 18px;
      font-weight: 600;
    }

    .salary-details {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      border: 1px solid #ddd;
      padding-left: 18px;
      padding-right: 20px;
    }

    .left-section,
    .right-section {
      width: 50%;
    }

    .right-section {
      border-left: 1px solid #ddd;
    }

    .right-section .row {
      margin-left: 15px;
    }

    .row {
      display: flex;
      margin-bottom: 10px;
    }

    .label {
      width: 40%;
      font-size: 15px;
      font-weight: 600;
      color: #222;
    }

    .value {
      width: 60%;
      font-size: 15px;
    }

    .salary-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    .salary-table th,
    .salary-table td {
      border: 1px solid #ddd;
      padding: 8px;
      padding-left: 15px;
      text-align: left;
      font-size: 15px;
      margin-top: 10px;
    }

    .net-pay {
      margin-top: 40px;
      border: 1px solid #ddd;
      padding: 10px;
      padding-left: 15px;
    }

    .net-pay .value {
      font-size: 15px;
      font-weight: 600;
      color: #222;
    }

    .attendance-summary {
      border: 1px solid #ddd;
      margin-top: 15px;
    }

    .attendance-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-left: 15px;
      padding-right: 15px;
    }

    .attendance-column {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .attendance-title {
      font-weight: 600;
      color: #222;
      font-size: 15px;
      margin-top: 10px;
    }

    .attendance-data {
      font-weight: normal;
      margin-top: 10px;
      font-size: 15px
    }

    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 14px;
      color: #333;
    }
  </style>
</head>

<body>
  <div class="page-wrapper">
    <div class="content">
      <div class="salary-slip">
        <div class="logo-section">
          <img class="logo" src="${logoSrc}" alt="logo" />
        </div>
        <div class="company-details">
          <h4 class="company-name">CODE DIFFUSION TECHNOLOGIES</h4>
          <hr />
        </div>

        <h6 class="salary-title">Salary Slip (January 2025)</h6>
        <div class="salary-details">
          <div class="left-section">
            <div class="row" style="margin-top: 8px;">
              <div class="label">Employee Name</div>
              <div class="value">John Doe</div>
            </div>
            <div class="row">
              <div class="label">Designation</div>
              <div class="value">Software Engineer</div>
            </div>
            <div class="row">
              <div class="label">Department</div>
              <div class="value">IT</div>
            </div>
            <div class="row">
              <div class="label">Date of Joining</div>
              <div class="value">01/01/2020</div>
            </div>
            <div class="row">
              <div class="label">Phone Number</div>
              <div class="value">123-456-7890</div>
            </div>
          </div>

          <div class="right-section">
            <div class="row" style="margin-top: 8px;">
              <div class="label">Transaction Id</div>
              <div class="value">TX12345</div>
            </div>
            <div class="row">
              <div class="label">Employee ID</div>
              <div class="value">EMP12345</div>
            </div>
            <div class="row">
              <div class="label">Monthly Gross</div>
              <div class="value">₹50,000</div>
            </div>
          </div>
        </div>

        <h6 class="payment-title">Payment & Salary (January 2025)</h6>
        <table class="salary-table">
          <thead>
            <tr>
              <th>Earnings</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Salary</td>
              <td>₹50,000</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>Total Earnings</th>
              <th>₹50,000</th>
            </tr>
          </tfoot>
        </table>

        <div class="net-pay">
          <div class="row">
            <div class="label">Net Payable (Total Earnings)</div>
            <div class="value">₹50,000</div>
          </div>
          <div class="row">
            <div class="label">Amount in Words</div>
            <div class="value">Fifty Thousand</div>
          </div>
        </div>

        <h6 class="attendance-summary-title">Attendance Summary (January 2025)</h6>
        <div class="attendance-summary">
          <div class="attendance-row">
            <div class="attendance-column">
              <div class="attendance-title">Present</div>
              <div class="attendance-data">20</div>
            </div>
            <div class="attendance-column">
              <div class="attendance-title">Absent</div>
              <div class="attendance-data">2</div>
            </div>
            <div class="attendance-column">
              <div class="attendance-title">Leave</div>
              <div class="attendance-data">1</div>
            </div>
            <div class="attendance-column">
              <div class="attendance-title">Comp Off</div>
              <div class="attendance-data">1</div>
            </div>
            <div class="attendance-column">
              <div class="attendance-title">Weekly Off</div>
              <div class="attendance-data">4</div>
            </div>
            <div class="attendance-column">
              <div class="attendance-title">Holiday</div>
              <div class="attendance-data">2</div>
            </div>
          </div>
        </div>
        <p class="footer">This is a digitally generated document and does not require a signature or seal.</p>
      </div>
    </div>
  </div>
</body>

</html>
  `;

        // Generate PDF from HTML
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(salarySlipHTML);
        const pdfPath = `salary_slip_arwaz.pdf`;
        await page.pdf({ path: pdfPath, format: 'A4' });
        await browser.close();

        // Email options
        const mailOptions = {
            from: 'no-reply@codediffusion.in',
            to: "mdarwaznew2023@gmail.com",
            subject: `Salary Slip for January 2025`,
            text: 'Please find attached your salary slip.',
            attachments: [
                {
                    filename: pdfPath,
                    path: pdfPath,
                },
            ],
        };

        // Send email
        transporter.sendMail(mailOptions, () => {
            fs.unlinkSync(pdfPath);
        });

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
