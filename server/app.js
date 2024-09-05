import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import cluster from "cluster";
import os from "os";
import compression from "compression";
import connectDatabase from "./database/connectDatabase.js";
import testRoute from "./routes/test.route.js";
import customerRoute from "./routes/customer.route.js";
import projectTypeRoute from "./routes/projectType.route.js";
import projectCategoryRoute from "./routes/projectCategory.route.js";
import projectStatusRoute from "./routes/projectStatus.route.js";
import projectRoute from "./routes/project.route.js";
import teamRoute from "./routes/team.route.js";
import projectTimingRoute from "./routes/projectTiming.route.js";
import roleRoute from "./routes/role.route.js";
import designationRoute from "./routes/designation.route.js";
import projectPriorityRoute from "./routes/projectPriority.route.js";
import invoiceRoute from "./routes/invoice.route.js";
import proformaInvoiceRoute from "./routes/proformaInvoice.route.js";
import attendanceRoute from "./routes/attendance.route.js";
import holidayRoute from "./routes/holiday.route.js";
import technologyRoute from "./routes/technology.route.js";

// Directory name for serving index.html file
const __dirname = path.resolve();

// Dotenv configuration
dotenv.config();

// Connect MongoDB database
connectDatabase();

// Number of CPUs
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary process is running with PID: ${process.pid}`);

  // Fork worker
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  };

  // Listen for dying workers and replace them
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Forking a new worker...`);
    cluster.fork();
  });

  // Workers can share any TCP connection. In this case, it is an HTTP server.
} else {
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

  // Middleware for serving client index,html file
  server.use(express.static(path.join(__dirname, "/client/dist")), (req, res, next) => next());

  // Route for serving client index.html file
  server.get("*", (req, res) => res.sendFile(path.join(__dirname, "/client/dist", "index.html")));

  // Environment variable
  const port = process.env.PORT || 8080;
  const mode = process.env.NODE_MODE;

  // Server listen 
  server.listen(port, () => console.log(`Server is successfully running in ${mode} on port number ${port} at base url http://localhost:${port}`));
};