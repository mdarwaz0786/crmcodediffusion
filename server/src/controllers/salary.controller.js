import Team from "../models/team.model.js";
import Attendance from "../models/attendance.model.js";
import Salary from "../models/salary.model.js";
import Holiday from "../models/holiday.model.js";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
import numberToWord from "../utils/numbeToWord.js";
import numberToMonthName from "../utils/numberToMonthName.js";
import formatDate from "../utils/formatDate.js";

dotenv.config();

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

    if (!employee || !month || !year || !amountPaid || !salaryPaid) {
      return res.status(400).json({ success: false, message: "Employee, month, year, amount paid and salary paid are required." });
    };

    const existingSalary = await Salary.findOne({ employee, month, year });

    if (existingSalary) {
      return res.status(400).json({ success: false, message: "Salary already paid." });
    };

    const emp = await Team
      .findById(employee)
      .populate("designation")
      .populate("department")
      .populate("office")
      .exec();

    if (!emp) {
      return res.status(400).json({ success: false, message: "Employee not found." });
    };

    let [requiredHours, requiredMinutes] = emp?.workingHoursPerDay?.split(":")?.map(Number);
    let dailyThreshold = requiredHours * 60 + requiredMinutes;
    let monthlySalary = emp?.monthlySalary;
    let workingHoursPerDay = emp?.workingHoursPerDay;

    let yearParsed = year;
    let monthIndex = month;
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
      } else if (date.getDay() === 0) {
        let attendanceRecord = await Attendance.findOne({
          employee: emp?._id,
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
        let leaveRecord = emp?.approvedLeaves?.some((leave) => leave?.date === formattedDate);
        let compOffRecord = emp?.eligibleCompOffDate?.some((comp) => comp?.compOffDate === formattedDate);
        if (holiday) {
          let attendanceRecord = await Attendance.findOne({
            employee: emp?._id,
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
            employee: emp?._id,
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
      workingHoursPerDay,
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
    }

    .salary-slip {
      padding: 10px;
      background-color: #fff;
    }

    .logo-section {
      margin-bottom: 40px;
    }

    .logo {
      width: 150px;
      height: 30px;
      object-fit: contain;
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
      margin-top: 40px;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
    }

    .payment-title,
    .deduction-summary-title {
      margin-top: 50px;
      font-size: 16px;
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
      width: 50%;
      font-size: 15px;
      font-weight: 600;
    }

    .value {
      font-size: 15px;
    }

    .salary-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
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

    .net-pay .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .net-pay .value {
      font-weight: 600;
    }

    .deduction-summary {
      border: 1px solid #ddd;
      margin-top: 10px;
    }

    .deduction-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-left: 15px;
      padding-right: 15px;
    }

    .deduction-column {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .deduction-title {
      font-weight: 600;
      font-size: 15px;
      margin-top: 10px;
    }

    .deduction-data {
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
  <div class="salary-slip">
    <div class="logo-section">
      <img class="logo" src="${emp?.office?.logo || logoSrc}" alt="logo" />
    </div>
    <div class="company-details">
      <h4 class="company-name">${emp?.office?.name || "CODE DIFFUSION TECHNOLOGIES"}</h4>
      <hr />
    </div>

    <h6 class="salary-title">Salary Slip (${numberToMonthName(month)} ${year})</h6>
    <div class="salary-details">
      <div class="left-section">
        <div class="row" style="margin-top: 8px;">
          <div class="label">Employee Name</div>
          <div class="value">${emp?.name}</div>
        </div>
        <div class="row">
          <div class="label">Designation</div>
          <div class="value">${emp?.designation?.name}</div>
        </div>
        <div class="row">
          <div class="label">Department</div>
          <div class="value">${emp?.department?.name}</div>
        </div>
        <div class="row">
          <div class="label">Date of Joining</div>
          <div class="value">${formatDate(emp?.joining)}</div>
        </div>
        <div class="row">
          <div class="label">Mobile Number</div>
          <div class="value">${emp?.mobile}</div>
        </div>
      </div>

      <div class="right-section">
        <div class="row" style="margin-top: 8px;">
          <div class="label">Transaction ID</div>
          <div class="value">${transactionId}</div>
        </div>
        <div class="row">
          <div class="label">Employee ID</div>
          <div class="value">${emp?.employeeId}</div>
        </div>
        <div class="row">
          <div class="label">Monthly Gross Salary</div>
          <div class="value">₹${emp?.monthlySalary}</div>
        </div>
      </div>
    </div>

    <h6 class="payment-title">Payment & Salary (${numberToMonthName(month)} ${year})</h6>
    <table class="salary-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Monthly Gross Salary</td>
          <td>₹${emp?.monthlySalary}</td>
        </tr>
        <tr>
          <td>Total Deduction (${salaryData?.deductionDays} × ₹${salaryData?.dailySalary})</td>
          <td>-₹${salaryData?.totalDeduction}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th>Net Salary</th>
          <th>₹${salaryData?.totalSalary}</th>
        </tr>
      </tfoot>
    </table>

    <div class="net-pay">
      <div class="row">
        <div class="label">Net Payable (Net Salary)</div>
        <div class="value">₹${salaryData?.totalSalary}</div>
      </div>
      <div class="row">
        <div class="label">Amount in Words</div>
        <div class="value">${numberToWord(salaryData?.totalSalary)}</div>
      </div>
    </div>

    <h6 class="deduction-summary-title">Salary Deduction Calculation (${numberToMonthName(month)} ${year})</h6>
    <div class="deduction-summary">
      <div class="deduction-row">
        <div class="deduction-column">
          <div class="deduction-title">Required Working Hours</div>
          <div class="deduction-data">${salaryData?.companyWorkingHours}</div>
        </div>
        <div class="deduction-column">
          <div class="deduction-title">Worked Hours</div>
          <div class="deduction-data">${salaryData?.employeeHoursWorked}</div>
        </div>
        <div class="deduction-column">
          <div class="deduction-title">Shortfall Hours</div>
          <div class="deduction-data">${salaryData?.employeeHoursShortfall}</div>
        </div>
        <div class="deduction-column">
          <div class="deduction-title">Deduction Days</div>
          <div class="deduction-data">${salaryData?.employeeHoursShortfall} / ${workingHoursPerDay} = ${salaryData?.deductionDays}</div>
        </div>
        <div class="deduction-column">
          <div class="deduction-title">Amount Deducted</div>
          <div class="deduction-data">${salaryData?.deductionDays} × ₹${salaryData?.dailySalary} = ${salaryData?.totalDeduction}</div>
        </div>
      </div>
    </div>

    <h6 class="deduction-summary-title">Attendance Summary (${numberToMonthName(month)} ${year})</h6>
    <div class="deduction-summary">
      <div class="deduction-row">
        <div class="deduction-column">
          <div class="deduction-title">Present</div>
          <div class="deduction-data">${salaryData?.totalPresent}</div>
        </div>
        <div class="deduction-column">
          <div class="deduction-title">Half Day</div>
          <div class="deduction-data">${salaryData?.totalHalfDays}</div>
        </div>
        <div class="deduction-column">
          <div class="deduction-title">Absent</div>
          <div class="deduction-data">${salaryData?.totalAbsent}</div>
        </div>
        <div class="deduction-column">
          <div class="deduction-title">Leave</div>
          <div class="deduction-data">${salaryData?.totalOnLeave}</div>
        </div>
        <div class="deduction-column">
          <div class="deduction-title">Comp Off</div>
          <div class="deduction-data">${salaryData?.totalCompOff}</div>
        </div>
        <div class="deduction-column">
          <div class="deduction-title">Weekly Off</div>
          <div class="deduction-data">${salaryData?.totalSundays}</div>
        </div>
        <div class="deduction-column">
          <div class="deduction-title">Holiday</div>
          <div class="deduction-data">${salaryData?.totalHolidays}</div>
        </div>
      </div>
    </div>
    <p class="footer">This is a digitally generated document and does not require a signature or seal.</p>
  </div>
</body>

</html>`;

    // Generate PDF from HTML
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/root/.cache/puppeteer/chrome/linux-133.0.6943.98/chrome-linux64/chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
    });
    const page = await browser.newPage();
    await page.setContent(salarySlipHTML);
    const pdfPath = `salary_slip_${emp?.name}_${numberToMonthName(month)}_${year}.pdf`;
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
    await browser.close();

    // Email options
    const mailOptions = {
      from: emp?.office?.noReplyEmail || process.env.SENDER_EMAIL_ID,
      to: emp?.email,
      subject: `Salary Slip for ${numberToMonthName(month)} ${year}`,
      text: `Dear ${emp?.name},

We hope you are doing well.

Please find attached your salary slip for ${numberToMonthName(month)} ${year}. The attached document includes a detailed breakdown of your earnings, deductions, and net pay for the mentioned period.

If you have any questions or need further clarification regarding your salary details, please feel free to reach out.

Thank you for your continued contributions to the team.

Best regards,
Abhishek Singh
${emp?.office?.name || "Code Diffusion Technologies"} 
${emp?.office?.contact || "7827114607"}
${emp?.office?.email || "info@codediffusion.in"}
${emp?.office?.websiteLink || "https://www.codediffusion.in/"}`,

      attachments: [
        {
          filename: pdfPath,
          path: pdfPath,
        },
      ],
    };

    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emp?.office?.noReplyEmail || process.env.SENDER_EMAIL_ID,
        pass: emp?.office?.noReplyEmailAppPassword || process.env.SENDER_EMAIL_APP_PASSWORD,
      },
    });

    // Send the email
    await transporter.sendMail(mailOptions);

    // Create a new salary record
    const newSalary = new Salary({ employee, month, year, salaryPaid, amountPaid, transactionId });

    // Save the salary record
    await newSalary.save();

    // Cleanup the generated PDF
    fs.unlinkSync(pdfPath);

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
    const updatedSalary = await Salary
      .findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

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
    const deletedSalary = await Salary
      .findByIdAndDelete(req.params.id);

    if (!deletedSalary) {
      return res.status(404).json({ success: false, message: "Salary record not found." });
    };

    return res.status(200).json({ success: true, message: "Salary record deleted successfully." });
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

    const employees = await Team.find();

    if (!employees || employees?.length === 0) {
      return res.status(400).json({ success: false, message: "Employees not found." });
    };

    const salaryData = await Promise.all(
      employees?.map(async (employee) => {
        let [requiredHours, requiredMinutes] = employee?.workingHoursPerDay?.split(":")?.map(Number);
        let dailyThreshold = requiredHours * 60 + requiredMinutes;
        let monthlySalary = employee?.monthlySalary;
        let workingHoursPerDay = employee?.workingHoursPerDay;

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
          month,
          totalDaysInMonth,
          employeeId: employee?._id,
          employeeName: employee?.name,
          monthlySalary,
          workingHoursPerDay,
          totalSalary: totalSalary.toFixed(2),
          totalDeduction: totalDeduction.toFixed(2),
          dailySalary: dailySalary.toFixed(2),
          companyWorkingHours: minutesToTime(companyWorkingMinutes),
          companyWorkingDays: totalDaysInMonth - (totalHolidays + totalSundays),
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
