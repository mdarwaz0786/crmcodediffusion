import jwt from "jsonwebtoken";

// Function for generate json web token
const generateToken = (teamId, employeeId, name, email, mobile, password, joining, dob, monthlySalary, workingHoursPerDay, designation, role, reportingTo, PAN, UAN, bankAccount, office, department, allotedLeaveBalance, currentLeaveBalance, usedLeaveBalance, leaveBalanceAllotedHistory, approvedLeaves, eligibleCompOffDate, isActive, fcmToken, deviceId, allowMultiDevice, userType) => {
  return jwt.sign({ teamId, employeeId, name, email, mobile, password, joining, dob, monthlySalary, workingHoursPerDay, designation, role, reportingTo, PAN, UAN, bankAccount, office, department, allotedLeaveBalance, currentLeaveBalance, usedLeaveBalance, leaveBalanceAllotedHistory, approvedLeaves, eligibleCompOffDate, isActive, fcmToken, deviceId, allowMultiDevice, userType }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.EXPIRES_IN });
};

export default generateToken;