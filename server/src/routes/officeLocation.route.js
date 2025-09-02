import express from "express";
import multer from "multer";
import {
  createOfficeLocation,
  deleteOfficeLocation,
  fetchAllOfficeLocation,
  fetchSingleOfficeLocation,
  updateOfficeLocation,
} from "../controllers/officeLocation.controller.js";
import { authenticateUser } from "../middleware/newAuth.middleware.js";
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = [
  "uniqueCode",
  "name",
  "websiteLink",
  "logo",
  "email",
  "noReplyEmail",
  "noReplyEmailAppPassword",
  "contact",
  "GSTNumber",
  "accountNumber",
  "accountName",
  "accountType",
  "bankName",
  "IFSCCode",
  "latitude",
  "longitude",
  "attendanceRadius",
  "addressLine1",
  "addressLine2",
  "addressLine3",
];

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post("/create-officeLocation", authenticateUser, checkMasterActionPermission("office", "create"), upload.single("logo"), createOfficeLocation);
router.get("/all-officeLocation", authenticateUser, fetchAllOfficeLocation);
router.get("/single-officeLocation/:id", authenticateUser, fetchSingleOfficeLocation);
router.put("/update-officeLocation/:id", authenticateUser, checkMasterActionPermission("office", "update"), checkFieldUpdatePermission("office", fields), upload.single("logo"), updateOfficeLocation);
router.delete("/delete-officeLocation/:id", authenticateUser, checkMasterActionPermission("office", "delete"), deleteOfficeLocation);

export default router;
