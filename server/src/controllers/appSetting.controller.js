import AppSetting from "../models/appSetting.model.js";

export const createAppSetting = async (req, res) => {
  try {
    const { appVersion, appName, playStoreLink, appStoreLink } = req.body;

    if (!appVersion) {
      return res.status(400).json({ succes: false, message: "App version is required" });
    };

    if (!appName) {
      return res.status(400).json({ succes: false, message: "App name is required" });
    };

    const newAppSetting = new AppSetting({ appVersion, appName, playStoreLink, appStoreLink });

    await newAppSetting.save();

    return res.status(201).json({ success: true, message: "App setting created successfully", data: newAppSetting })
  } catch (error) {
    return res.status(500).json({ success: false, message: "server error" });
  };
};

export const getAllAppSetting = async (req, res) => {
  try {
    const appSetting = await AppSetting.find({});

    if (!appSetting) {
      return res.status(404).json({ success: false, message: "App setting not found." })
    };

    return res.status(200).json({ success: true, message: "All app setting fetched successfully", data: appSetting })
  } catch (error) {
    return res.status(500).json({ success: false, message: "server error" })
  };
};

export const getSingleAppSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const appSetting = await AppSetting.findById(id);

    if (!appSetting) {
      return res.status(404).json({ succes: false, message: "App setting not found" });
    };

    return res.status(200).json({ success: true, message: "Single app setting fetched successfully", data: appSetting })
  } catch (error) {
    return res.status(500).json({ success: false, message: "server error" })
  };
};

export const updateAppSetting = async (req, res) => {
  try {
    const { appName, appVersion, playStoreLink, appStoreLink } = req.body;
    const { id } = req.params;

    const appSetting = await AppSetting.findById(id);

    if (!appSetting) {
      return res.status(404).json({ success: false, message: "App setting not found" })
    };

    appSetting.appName = appName;
    appSetting.appVersion = appVersion;
    appSetting.playStoreLink = playStoreLink;
    appSetting.appStoreLink = appStoreLink;

    await appSetting.save();

    return res.status(200).json({ success: true, message: "App setting updated successfully" })
  } catch (error) {
    return res.status(500).json({ success: false, message: "server error" })
  };
};

export const deleteAppSetting = async (req, res) => {
  try {
    const { id } = req.params;

    const appSetting = await AppSetting.findById(id);

    if (!appSetting) {
      return res.status(404).json({ success: false, message: "App setting not found" })
    };

    await AppSetting.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "App setting deleted successfully" })
  } catch (error) {
    return res.status(500).json({ success: false, message: "server error" });
  };
};