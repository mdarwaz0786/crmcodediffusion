import jwt from "jsonwebtoken";
import Team from "../models/team.model.js";
import Customer from "../models/customer.model.js";
import Company from "../models/company.model.js";

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
        .populate({ path: "company", select: "-password" })
        .exec();

      if (!clientData) {
        return res.status(401).json({ success: false, message: "Client not found or unauthorized" });
      };

      req.team = clientData;
      req.token = jwtToken;
      req.teamId = clientData?._id;
      req.teamType = isVerified.userType;
      req.company = clientData?.company?._id;
      req.isSuperAdmin = clientData?.isSuperAdmin;
    } else if (isVerified.userType === "Employee") {
      const teamData = await Team
        .findOne({ employeeId: isVerified.employeeId })
        .populate({ path: "role", select: "" })
        .populate({ path: "designation", select: "name" })
        .populate({ path: "reportingTo", select: "name" })
        .populate({ path: "department", select: "name" })
        .populate({ path: "office", select: "" })
        .populate({ path: "company", select: "-password" })
        .exec();

      if (!teamData) {
        return res.status(401).json({ success: false, message: "Employee not found or unauthorized" });
      };

      req.team = teamData;
      req.token = jwtToken;
      req.teamId = teamData._id;
      req.teamType = isVerified.userType;
      req.company = teamData?.company?._id;
      req.isSuperAdmin = teamData?.isSuperAdmin;
    } else if (isVerified.userType === "Company") {
      const companyData = await Company
        .findOne({ email: isVerified.email })
        .populate({ path: "role", select: "" })
        .exec();

      if (!companyData) {
        return res.status(401).json({ success: false, message: "Company not found or unauthorized" });
      };

      req.team = companyData;
      req.token = jwtToken;
      req.teamId = companyData?._id;
      req.teamType = isVerified?.userType;
      req.company = companyData?._id;
      req.isSuperAdmin = companyData?.isSuperAdmin;
    };

    next();

  } catch (error) {
    return res.status(401).json({ success: false, message: `Unauthorized: ${error.message}` });
  };
};