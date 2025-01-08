import mongoose from "mongoose";

const holidayFileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileData: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('HolidayFile', holidayFileSchema);
