import Team from "../models/team.model.js";
import Company from "../models/company.model.js";
import Customer from "../models/customer.model.js";
import createToken from "../utils/createToken.js";

export const login = async (req, res) => {
  try {
    const { loginId, password, deviceId, fcmToken, appLogin } = req.body;
    let userType;

    const team = await Team.findOne({ employeeId: loginId });

    if (team) {
      if (password?.trim() !== team?.password) {
        return res.status(401).json({ success: false, message: "Invalid Password" });
      };

      userType = "Employee";

      if (appLogin) {
        if (!team?.allowMultiDevice) {
          if (!team?.deviceId) {
            team.deviceId = deviceId;
            await team.save();
          } else if (team?.deviceId !== deviceId) {
            return res.status(403).json({ success: false, message: "You are not authorized to login in this device." });
          };
        } else {
          team.deviceId = deviceId;
          await team.save();
        };
      };

      if (!!fcmToken) {
        team.fcmToken = fcmToken;
        await team.save();
      };

      return res.status(200).json({
        success: true,
        message: "Login successful",
        userType,
        token: createToken(team?._id, userType),
      });
    };

    const customer = await Customer.findOne({ mobile: loginId });

    if (customer) {
      if (password?.trim() !== customer?.password) {
        return res.status(401).json({ success: false, message: "Invalid Password" });
      };

      userType = "Client";

      if (!!fcmToken) {
        customer.fcmToken = fcmToken;
        await customer.save();
      };

      if (!!deviceId) {
        customer.deviceId = deviceId;
        await customer.save();
      };

      return res.status(200).json({
        success: true,
        message: "Login successful",
        userType,
        token: createToken(customer?._id, userType),
      });
    };

    const company = await Company.findOne({ email: loginId });

    if (company) {
      if (password?.trim() !== company?.password) {
        return res.status(401).json({ success: false, message: "Invalid Password" });
      };

      userType = "Company";

      if (!!fcmToken) {
        company.fcmToken = fcmToken;
        await company.save();
      };

      if (!!deviceId) {
        company.deviceId = deviceId;
        await company.save();
      };

      return res.status(200).json({
        success: true,
        message: "Login successful",
        userType,
        token: createToken(company?._id, userType),
      });
    };

    return res.status(401).json({ success: true, message: "Invalid Login ID" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};
