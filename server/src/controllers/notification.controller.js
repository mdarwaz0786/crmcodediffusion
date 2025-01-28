import Notification from "../models/notification.model.js";
import Employee from "../models/team.model.js";
import firebase from "../firebase/index.js";

// Send notification
export const createNotification = async (req, res) => {
  try {
    const { employee, message, toAll } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    };

    let fcmTokens = [];

    if (toAll) {
      const employees = await Employee.find({ fcmToken: { $exists: true, $ne: null } });
      fcmTokens = employees.map(emp => emp.fcmToken);
    } else {
      if (!employee || employee.length === 0) {
        return res.status(400).json({ success: false, message: "Employee IDs are required." });
      };
      const employees = await Employee.find({ _id: { $in: employee }, fcmToken: { $exists: true, $ne: null } });
      fcmTokens = employees.map((emp) => emp.fcmToken);
    };

    if (fcmTokens.length === 0) {
      return res.status(400).json({ success: false, message: "No valid FCM tokens found." });
    };

    // Firebase Notification Payload
    const payload = {
      notification: {
        title: "From Code Diffusion",
        body: message,
      },
    };

    // Send notifications to all FCM tokens
    const responses = await Promise.allSettled(fcmTokens.map((token) => firebase.messaging().send({ ...payload, token })));

    const failedTokens = responses.filter((res) => res.status === "rejected").map((_, index) => fcmTokens[index]);

    return res.status(200).json({ success: true, message: "Notifications sent successfully.", failedTokens });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, message: "Error in sending notifications.", error: error.message });
  };
};

// Get all Notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().populate("employee");
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  };
};

// Get single Notification by ID
export const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id).populate("employee",);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    };

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  };
};

// Get Notifications by Employee ID or toAll
export const getNotificationsByEmployeeOrAll = async (req, res) => {
  try {
    const { employeeId } = req.query;

    let filter = {};

    if (employeeId) {
      filter = {
        $or: [
          { employee: { $in: [employeeId] } },
          { toAll: true },
        ],
      };
    } else {
      filter = { toAll: true };
    };

    const notifications = await Notification.find(filter).populate("employee");

    if (!notifications) {
      return res.status(404).json({ success: false, message: "No notifications found." });
    };

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.elog(error.message);
    res.status(500).json({ success: false, message: error.message });
  };
};

// Update Notification by ID
export const updateNotification = async (req, res) => {
  try {
    const { message, employee, date, sendBy, toAll } = req.body;

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { message, employee, date, sendBy, toAll },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    };

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  };
};

// Delete Notification by ID
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    };

    res.status(200).json({ success: true, message: "Notification deleted successfully." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  };
};
