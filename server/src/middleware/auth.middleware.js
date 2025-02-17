import jwt from "jsonwebtoken";
import Team from "../models/team.model.js";
import Customer from "../models/customer.model.js";

export const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(404).json({ success: false, message: "Token not found" });
    };

    const jwtToken = token.replace("Bearer", "").trim();
    const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);

    if (isVerified.userType === "Client") {
      const clientData = await Customer
        .findOne({ mobile: isVerified.mobile })
        .populate({ path: "role", select: "" })
        .exec();

      if (!clientData) {
        return res.status(401).json({ success: false, message: "Client not found or unauthorized" });
      };

      req.client = clientData;
      req.token = jwtToken;
      req.clientId = clientData?._id;
    } else {
      const teamData = await Team
        .findOne({ employeeId: isVerified.employeeId })
        .populate({ path: "role", select: "" })
        .populate({ path: "designation", select: "name" })
        .populate({ path: "reportingTo", select: "name" })
        .populate({ path: "department", select: "name" })
        .populate({ path: "office", select: "" })
        .exec();

      if (!teamData) {
        return res.status(401).json({ success: false, message: "Employee not found or unauthorized" });
      };

      req.team = teamData;
      req.token = jwtToken;
      req.teamId = teamData._id;
    };

    next();

  } catch (error) {
    return res.status(401).json({ success: false, message: `Unauthorized: ${error.message}` });
  };
};