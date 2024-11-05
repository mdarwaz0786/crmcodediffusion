import express from 'express';
import { createSalary, deleteSalary, fetchAllSalary, fetchSingleSalary, updateSalary } from '../controllers/salary.controller.js';
import { isLoggedIn } from '../middleware/auth.middleware.js';

const router = express.Router();

// Define the routes
router.post('/create-salary', isLoggedIn, createSalary);
router.get('/all-salary', isLoggedIn, fetchAllSalary);
router.get('/single-salary/:id', isLoggedIn, fetchSingleSalary);
router.put('/update-salary/:id', isLoggedIn, updateSalary);
router.delete('/delete-salary/:id', isLoggedIn, deleteSalary);

export default router;
