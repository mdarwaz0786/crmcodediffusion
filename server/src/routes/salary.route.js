import express from 'express';
import { createSalary, deleteSalary, getAllSalaries, getSalaryById, newFetchMonthlySalary, updateSalary } from '../controllers/salary.controller.js';
import { authenticateUser } from '../middleware/newAuth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ["transactionId"];

// router object
const router = express.Router();

// Define the routes
router.post('/create-salary', authenticateUser, checkMasterActionPermission("salary", "create"), createSalary);
router.get('/all-salary', authenticateUser, getAllSalaries);
router.get('/single-salary/:id', authenticateUser, getSalaryById);
router.get('/monthly-salary', authenticateUser, newFetchMonthlySalary);
router.put('/update-salary/:id', authenticateUser, checkMasterActionPermission("salary", "update"), checkFieldUpdatePermission("salary", fields), updateSalary);
router.delete('/delete-salary/:id', authenticateUser, checkMasterActionPermission("salary", "delete"), deleteSalary);

export default router;
