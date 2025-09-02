import Notification from "../models/notification.model.js";
import Employee from "../models/team.model.js";
import firebase from "../firebase/index.js";

// Send notification
export const createNotification = async (req, res) => {
  try {
    const { employee, message, toAll, date } = req.body;
    const company = req.company;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    };

    let fcmTokens = [];
    let employeeIds = [];

    if (toAll) {
      const employees = await Employee.find({ fcmToken: { $exists: true, $ne: null }, company });
      fcmTokens = employees?.map((emp) => emp?.fcmToken);
      employeeIds = employees?.map((emp) => emp?._id);
    } else {
      if (!employee || employee?.length === 0) {
        return res.status(400).json({ success: false, message: "Employee IDs are required." });
      };
      const employees = await Employee.find({ _id: { $in: employee }, fcmToken: { $exists: true, $ne: null }, company });
      fcmTokens = employees?.map((emp) => emp?.fcmToken);
      employeeIds = employees?.map((emp) => emp?._id);
    };

    if (fcmTokens?.length === 0) {
      return res.status(400).json({ success: false, message: "No valid FCM tokens found." });
    };

    // Firebase Notification Payload
    const payload = {
      notification: {
        title: "Code Diffusion",
        body: message,
      },
    };

    // Send notifications to all FCM tokens
    await Promise.allSettled(fcmTokens.map((token) => firebase.messaging().send({ ...payload, token })));

    // Save notification to database
    const newNotification = new Notification({
      employee: employeeIds,
      message,
      toAll,
      sendBy,
      date,
      seenBy,
      company,
    });

    await newNotification.save();
    return res.status(200).json({ success: true, data: newNotification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get all Notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ company: req.company }).populate("employee");
    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get single Notification by ID
export const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, company: req.company }).populate("employee");

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    };

    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get Notifications by Employee IDs
export const getNotificationsByEmployee = async (req, res) => {
  try {
    const { employeeId, page, limit } = req.query;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: "Employee ID is required." });
    };

    // Filter notifications by the provided employee ID
    const filter = { employee: { $in: [employeeId] }, company: req.company };

    // Convert query parameters to numbers
    const pageNumber = Number(page);
    const limitValue = Number(limit);
    const skipValue = (pageNumber - 1) * limitValue;

    // Pagination and sorting logic
    const notifications = await Notification
      .find(filter)
      .populate("employee")
      .sort({ createdAt: -1 })
      .skip(skipValue)
      .limit(limitValue);

    const totalNotifications = await Notification.countDocuments(filter);

    if (!notifications) {
      return res.status(404).json({ success: false, message: "No notifications found." });
    };

    // Response includes pagination details
    return res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total: totalNotifications,
        page: pageNumber,
        totalPages: Math.ceil(totalNotifications / limitValue),
        limit: limitValue,
        skip: skipValue,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Update Notification by ID
export const updateNotification = async (req, res) => {
  try {
    const { message, employee, date, toAll } = req.body;

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, company: req.company },
      { message, employee, date, toAll, },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    };

    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Delete Notification by ID
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, company: req.company });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    };

    return res.status(200).json({ success: true, message: "Notification deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};
