import Holiday from "../models/holiday.model.js"; // Adjust the import path as per your project structure

// Create a new holiday
export const createHoliday = async (req, res) => {
  try {
    const { reason, date } = req.body;

    const newHoliday = new Holiday({
      reason,
      date,
    });

    await newHoliday.save();
    res.status(201).json({ message: "Holiday created successfully", data: newHoliday });
  } catch (error) {
    res.status(500).json({ message: "Error creating holiday", error: error.message });
  }
};

// Get all holidays
export const fetchAllHoliday = async (req, res) => {
  try {
    const holidays = await Holiday.find();
    res.status(200).json({ data: holidays });
  } catch (error) {
    res.status(500).json({ message: "Error fetching holidays", error: error.message });
  }
};

// Get a single holiday by ID
export const fetchSingleHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const holiday = await Holiday.findById(id);

    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }
    res.status(200).json({ data: holiday });
  } catch (error) {
    res.status(500).json({ message: "Error fetching holiday", error: error.message });
  }
};

// Update a holiday
export const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, date } = req.body;

    const updatedHoliday = await Holiday.findByIdAndUpdate(
      id,
      { reason, date },
      { new: true, runValidators: true }
    );

    if (!updatedHoliday) {
      return res.status(404).json({ message: "Holiday not found" });
    }
    res.status(200).json({ message: "Holiday updated successfully", data: updatedHoliday });
  } catch (error) {
    res.status(500).json({ message: "Error updating holiday", error: error.message });
  }
};

// Delete a holiday
export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedHoliday = await Holiday.findByIdAndDelete(id);
    if (!deletedHoliday) {
      return res.status(404).json({ message: "Holiday not found" });
    }
    res.status(200).json({ message: "Holiday deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting holiday", error: error.message });
  }
};
