import jwt from "jsonwebtoken";

// Function for generate json web token
const generateClientToken = (clientId, name, email, password, mobile, GSTNumber, companyName, state, address, role, fcmToken, userType) => {
  return jwt.sign({ clientId, name, email, password, mobile, GSTNumber, companyName, state, address, role, fcmToken, userType }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.EXPIRES_IN });
};

export default generateClientToken;