import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import compression from "compression";
import connectDatabase from "./src/database/connectDatabase.js";
import "./src/jobs/projectDeployment/domainExpiryStatusSendEmail.js";
import "./src/jobs/projectDeployment/domainExpiryStatusUpdate.js";
import "./src/jobs/attendance/addLeaveBalance.js";
// import "./src/jobs/attendance/markAbsent.js";
// import "./src/jobs/attendance/markCompOff.js";
// import "./src/jobs/attendance/markHoliday.js";
// import "./src/jobs/attendance/markOnLeave.js";
// import "./src/jobs/attendance/markSunday.js";
import testRoute from "./src/routes/test.route.js";
import customerRoute from "./src/routes/customer.route.js";
import projectTypeRoute from "./src/routes/projectType.route.js";
import projectCategoryRoute from "./src/routes/projectCategory.route.js";
import projectStatusRoute from "./src/routes/projectStatus.route.js";
import projectRoute from "./src/routes/project.route.js";
import teamRoute from "./src/routes/team.route.js";
import projectTimingRoute from "./src/routes/projectTiming.route.js";
import roleRoute from "./src/routes/role.route.js";
import designationRoute from "./src/routes/designation.route.js";
import departmentRoute from "./src/routes/department.route.js";
import projectPriorityRoute from "./src/routes/projectPriority.route.js";
import invoiceRoute from "./src/routes/invoice.route.js";
import proformaInvoiceRoute from "./src/routes/proformaInvoice.route.js";
import attendanceRoute from "./src/routes/attendance.route.js";
import newAttendanceRoute from "./src/routes/newAttendance.route.js";
import salaryRoute from "./src/routes/salary.route.js";
import holidayRoute from "./src/routes/holiday.route.js";
import leaveApprovalRoute from "./src/routes/leaveApproval.route.js";
import officeLocationRoute from "./src/routes/officeLocation.route.js";
import technologyRoute from "./src/routes/technology.route.js";
import purchaseInvoiceRoute from "./src/routes/purchaseInvoice.route.js";
import projectDeploymentRoute from "./src/routes/projectDeployment.route.js";
import serviceRoute from "./src/routes/service.route.js";
import addOnServiceRoute from "./src/routes/addOnService.route.js";
import missedPunchOutRoute from "./src/routes/missedPunchOut.route.js";
import latePunchInRoute from "./src/routes/latePunchIn.route.js";
import compOffRoute from "./src/routes/compOff.route.js";
import workSummaryRoute from "./src/routes/workSummary.route.js";
import notificationRoute from "./src/routes/notification.route.js";
import projectWorkRoute from "./src/routes/projectWork.route.js";
import ticketRoute from "./src/routes/ticket.route.js";
import paymentRoute from "./src/routes/payment.route.js";
import enquiryRoute from "./src/routes/contactEnquiry.route.js";
import leedRoute from "./src/routes/leeds.route.js";
import leaveBalanceRoute from "./src/routes/leaveBalance.route.js";
import appSettingRoute from "./src/routes/appSetting.route.js";

// Directory name for serving index.html file
const __dirname = path.resolve();

// Dotenv configuration
dotenv.config();

// Connect MongoDB database
connectDatabase();

// REST API object
const server = express();

// Set view engine
server.set("view engine", "ejs");
server.set("views", "./src/views");

// Middleware
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(compression());
server.use(cors());

// Test route
server.use("/api/v1", testRoute);
// Customer route
server.use("/api/v1/customer", customerRoute);
// Project type route
server.use("/api/v1/projectType", projectTypeRoute);
// Project category route
server.use("/api/v1/projectCategory", projectCategoryRoute);
// Project Status route
server.use("/api/v1/projectStatus", projectStatusRoute);
// Team route
server.use("/api/v1/team", teamRoute);
// Project route
server.use("/api/v1/project", projectRoute);
// Project timing route
server.use("/api/v1/projectTiming", projectTimingRoute);
// Role route
server.use("/api/v1/role", roleRoute);
// Designation route
server.use("/api/v1/designation", designationRoute);
// Department route
server.use("/api/v1/department", departmentRoute);
// Project priority route
server.use("/api/v1/projectPriority", projectPriorityRoute);
// Invoice route
server.use("/api/v1/invoice", invoiceRoute);
// Proforma invoice route
server.use("/api/v1/proformaInvoice", proformaInvoiceRoute);
// Attendance route
server.use("/api/v1/attendance", attendanceRoute);
// New attendance route
server.use("/api/v1/newAttendance", newAttendanceRoute);
// Salary route
server.use("/api/v1/salary", salaryRoute);
// Holiday route
server.use("/api/v1/holiday", holidayRoute);
// Leave approval route
server.use("/api/v1/leaveApproval", leaveApprovalRoute);
// Office location route
server.use("/api/v1/officeLocation", officeLocationRoute);
// Technology route
server.use("/api/v1/technology", technologyRoute);
// Purchase invoice route
server.use("/api/v1/purchaseInvoice", purchaseInvoiceRoute);
// Project deployment route
server.use("/api/v1/projectDeployment", projectDeploymentRoute);
// Service route
server.use("/api/v1/service", serviceRoute);
// Add on service route
server.use("/api/v1/addOnService", addOnServiceRoute);
// Missed punch out route
server.use("/api/v1/missedPunchOut", missedPunchOutRoute);
// Late punch in out route
server.use("/api/v1/latePunchIn", latePunchInRoute);
// Comp off route
server.use("/api/v1/compOff", compOffRoute);
// Work summary route
server.use("/api/v1/workSummary", workSummaryRoute);
// Notification route
server.use("/api/v1/notification", notificationRoute);
// Project work route
server.use("/api/v1/projectWork", projectWorkRoute);
// Ticket route
server.use("/api/v1/ticket", ticketRoute);
// Payment route
server.use("/api/v1/payment", paymentRoute);
// Enquiry route
server.use("/api/v1/enquiry", enquiryRoute);
// Leed route
server.use("/api/v1/leed", leedRoute);
// Leave balance route
server.use("/api/v1/leave", leaveBalanceRoute);
// App setting route
server.use("/api/v1/appSetting", appSettingRoute);

// Middleware for serving client index.html file
server.use(express.static(path.join(__dirname, "../client/dist")), (req, res, next) => next());

// Route for serving client index.html file
server.get("*", (req, res) => res.sendFile(path.join(__dirname, "../client/dist", "index.html")));

// Environment variable
const port = process.env.PORT;
const mode = process.env.NODE_MODE;

// Server listen
server.listen(port, () => console.log(`✅ Server is successfully running in ${mode} mode on port number ${port} at base url http://localhost:${port}`));