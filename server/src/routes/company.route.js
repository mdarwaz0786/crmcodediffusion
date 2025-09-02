import express from "express";
import multer from "multer";
import { authenticateUser } from "../middleware/newAuth.middleware.js";
import { createCompany, deleteCompany, getCompanies, getCompany, loggedInCompany, updateCompany } from "../controllers/company.controller.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post("/create-company", authenticateUser, upload.single("logo"), createCompany);
router.get("/loggedin-company", authenticateUser, loggedInCompany);
router.get("/all-company", authenticateUser, getCompanies);
router.get("/single-company/:id", authenticateUser, getCompany);
router.put("/update-company/:id", authenticateUser, upload.single("logo"), updateCompany);
router.delete("/delete-company/:id", authenticateUser, deleteCompany);

export default router;
