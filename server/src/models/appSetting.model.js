import mongoose from "mongoose";

const appSettingSchema = new mongoose.Schema({
  appVersion: {
    type: String,
    required: [true, "Android App version is required"],
    trim: true,
  },
  iosAppVersion: {
    type: String,
    required: [true, "IOS app version is required"],
    trim: true,
  },
  appName: {
    type: String,
    required: [true, "App name is required"],
    trim: true,
  },
  playStoreLink: {
    type: String,
    trim: true,
  },
  appStoreLink: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Enable", "Disable"],
    default: "Enable",
  },
}, { timestamps: true });

export default mongoose.model("AppSetting", appSettingSchema);