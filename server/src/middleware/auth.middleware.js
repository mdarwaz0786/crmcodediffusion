import jwt from "jsonwebtoken";
import Team from "../models/team.model.js";

export const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(404).json({ success: false, message: "Token not found" });
    };

    const jwtToken = token.replace("Bearer", "").trim();
    const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
    const teamData = await Team.findOne({ employeeId: isVerified.employeeId })
      .populate({ path: "role", select: "" })
      .populate({ path: "designation", select: "name" })
      .populate({ path: "reportingTo", select: "name" })
      .exec();

    req.team = teamData;
    req.token = jwtToken;
    req.teamId = teamData._id;

    next();

  } catch (error) {
    console.log("Employee is not logged in:", error.message);
    return res.status(401).json({ success: false, message: `Employee is not logged in: ${error.message}` });
  };
};