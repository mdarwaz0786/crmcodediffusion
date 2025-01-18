import Notification from "../models/notification.model.js";

// Create Notification
export const createNotification = async (req, res) => {
  try {
    const { employee, date, sendBy, message, toAll } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    };

    if ((!employee || employee.length === 0) && !toAll) {
      return res.status(400).json({ success: false, message: "Either employee or send to all must be check." });
    };

    const newNotification = new Notification({ employee, date, sendBy, message, toAll });

    await newNotification.save();

    res.status(201).json({ success: true, data: newNotification });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
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
