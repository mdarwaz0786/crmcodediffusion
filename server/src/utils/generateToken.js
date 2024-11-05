import jwt from "jsonwebtoken";

// Function for generate json web token
const generateToken = (teamId, employeeId, name, email, mobile, password, joining, dob, monthlySalary, workingHoursPerDay, designation, role, reportingTo) => {
  return jwt.sign({ teamId, employeeId, name, email, mobile, password, joining, dob, monthlySalary, workingHoursPerDay, designation, role, reportingTo }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.EXPIRES_IN });
};

export default generateToken;