import express from "express";
import { createTeam, deleteTeam, fetchAllTeam, fetchSingleTeam, loggedInTeam, loginTeam, updateTeam } from "../controllers/team.controller.js";
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = [
  'name',
  'email',
  'mobile',
  'password',
  'joining',
  'dob',
  'monthlySalary',
  'UAN',
  'PAN',
  'bankAccount',
  'workingHoursPerDay',
  'designation',
  'office',
  'department',
  'role',
  'reportingTo',
  'isActive',
  'allowMultiDevice',
];

// router object
const router = express.Router();

// routes
router.post("/create-team", authenticateUser, checkMasterActionPermission("team", "create"), createTeam);
router.post("/login-team", loginTeam);
router.get("/loggedin-team", authenticateUser, loggedInTeam);
router.get("/all-team", authenticateUser, fetchAllTeam);
router.get("/single-team/:id", authenticateUser, fetchSingleTeam);
router.put("/update-team/:id", authenticateUser, checkMasterActionPermission("team", "update"), checkFieldUpdatePermission('team', fields), updateTeam);
router.delete("/delete-team/:id", authenticateUser, checkMasterActionPermission("team", "delete"), deleteTeam);

export default router;




