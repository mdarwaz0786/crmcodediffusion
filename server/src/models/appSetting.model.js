import mongoose from "mongoose";

const appSettingSchema = new mongoose.Schema({
  appVersion: {
    type: String,
    required: [true, "App version is required"],
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
}, { timestamps: true });

export default mongoose.model("AppSetting", appSettingSchema);