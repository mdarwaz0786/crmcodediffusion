import jwt from "jsonwebtoken";

// Function for create json web token
const createToken = (id, userType) => {
  return jwt.sign({ id, userType }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.EXPIRES_IN });
};

export default createToken;