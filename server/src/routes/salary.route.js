import express from 'express';
import { fetchMonthlySalary } from '../controllers/salary.controller.js';
import { isLoggedIn } from '../middleware/auth.middleware.js';

const router = express.Router();

// Define the routes
router.get('/monthly-salary', isLoggedIn, fetchMonthlySalary);

export default router;
