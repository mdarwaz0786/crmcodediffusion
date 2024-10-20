import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import compression from "compression";
import connectDatabase from "./src/database/connectDatabase.js";
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
import projectPriorityRoute from "./src/routes/projectPriority.route.js";
import invoiceRoute from "./src/routes/invoice.route.js";
import proformaInvoiceRoute from "./src/routes/proformaInvoice.route.js";
import attendanceRoute from "./src/routes/attendance.route.js";
import holidayRoute from "./src/routes/holiday.route.js";
import technologyRoute from "./src/routes/technology.route.js";
import purchaseInvoiceRoute from "./src/routes/purchaseInvoice.route.js";

// Directory name for serving index.html file
const __dirname = path.resolve();

// Dotenv configuration
dotenv.config();

// Connect MongoDB database
connectDatabase();

// REST API object
const server = express();

// Middleware
server.use(express.json());
server.use(compression());
server.use(cors());

// Test route
server.use("/api/v1", testRoute);
// Client route
server.use("/api/v1/customer", customerRoute);
// Project type route
server.use("/api/v1/projectType", projectTypeRoute);
// Project category route
server.use("/api/v1/projectCategory", projectCategoryRoute);
// Project Status route
server.use("/api/v1/projectStatus", projectStatusRoute);
// Employee route
server.use("/api/v1/team", teamRoute);
// Project route
server.use("/api/v1/project", projectRoute);
// Project timeline route
server.use("/api/v1/projectTiming", projectTimingRoute);
// Role route
server.use("/api/v1/role", roleRoute);
// Designation route
server.use("/api/v1/designation", designationRoute);
// Project priority route
server.use("/api/v1/projectPriority", projectPriorityRoute);
// Invoice route
server.use("/api/v1/invoice", invoiceRoute);
// Proforma invoice route
server.use("/api/v1/proformaInvoice", proformaInvoiceRoute);
// Attendance route
server.use("/api/v1/attendance", attendanceRoute);
// Holiday route
server.use("/api/v1/holiday", holidayRoute);
// Technology route
server.use("/api/v1/technology", technologyRoute);
// Purchase invoice route
server.use("/api/v1/purchaseInvoice", purchaseInvoiceRoute);

// Middleware for serving client index,html file
server.use(express.static(path.join(__dirname, "../client/dist")), (req, res, next) => next());

// Route for serving client index.html file
server.get("*", (req, res) => res.sendFile(path.join(__dirname, "../client/dist", "index.html")));

// Environment variable
const port = process.env.PORT;
const mode = process.env.NODE_MODE;

// Server listen 
server.listen(port, () => console.log(`Server is successfully running in ${mode} on port number ${port} at base url http://localhost:${port}`));