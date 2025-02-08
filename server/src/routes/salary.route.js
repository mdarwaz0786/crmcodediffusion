import express from 'express';
import { createSalary, deleteSalary, fetchMonthlySalary, getAllSalaries, getSalaryById, newFetchMonthlySalary, updateSalary } from '../controllers/salary.controller.js';
import { isLoggedIn } from '../middleware/auth.middleware.js';

const router = express.Router();

// Define the routes
router.post('/create-salary', isLoggedIn, createSalary);
router.get('/all-salary', isLoggedIn, getAllSalaries);
router.get('/single-salary/:id', isLoggedIn, getSalaryById);
router.put('/update-salary/:id', isLoggedIn, updateSalary);
router.delete('/delete-salary/:id', isLoggedIn, deleteSalary);
router.get('/monthly-salary', isLoggedIn, newFetchMonthlySalary);

export default router;
