import express from "express";
import multer from "multer";
import {
  createOfficeLocation,
  deleteOfficeLocation,
  fetchAllOfficeLocation,
  fetchSingleOfficeLocation,
  updateOfficeLocation,
} from "../controllers/officeLocation.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post("/create-officeLocation", isLoggedIn, upload.single("logo"), createOfficeLocation);
router.get("/all-officeLocation", isLoggedIn, fetchAllOfficeLocation);
router.get("/single-officeLocation/:id", isLoggedIn, fetchSingleOfficeLocation);
router.put("/update-officeLocation/:id", isLoggedIn, upload.single("logo"), updateOfficeLocation);
router.delete("/delete-officeLocation/:id", isLoggedIn, deleteOfficeLocation);

export default router;
