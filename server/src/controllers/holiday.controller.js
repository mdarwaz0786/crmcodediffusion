import Holiday from "../models/holiday.model.js";

// Create a new holiday
export const createHoliday = async (req, res) => {
  try {
    const { reason, type, date } = req.body;

    if (!reason || !date) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    };

    const existingHoliday = await Holiday.findOne({ date });

    if (existingHoliday) {
      return res.status(400).json({ success: false, message: `Holiday already exists for date ${date}` });
    };

    const holiday = new Holiday({ reason, type, date });
    await holiday.save();

    res.status(200).json({ success: true, message: "Holiday created successfully", holiday });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  };
};

// Get all upcoming holidays
export const fetchUpcomingHoliday = async (req, res) => {
  try {
    const currentDate = new Date().toISOString().split("T")[0];

    const holiday = await Holiday.find({ date: { $gte: currentDate } })
      .sort({ date: 1 })
      .exec();

    res.status(200).json({ success: true, holiday });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  };
};

// Get all holidays
export const fetchAllHoliday = async (req, res) => {
  try {
    let query = {};
    let sort = {};

    // Filter by year only (all month)
    if (req.query.year && !req.query.month) {
      const year = req.query.year;
      query.date = {
        $gte: `${year}-01-01`,
        $lte: `${year}-12-31`,
      };
    };

    // Filter by month only (all years)
    if (req.query.month && !req.query.year) {
      const month = req.query.month;
      query.date = { $regex: `-${month}-`, $options: "i" };
    };

    // Filter by both year and month
    if (req.query.year && req.query.month) {
      const year = req.query.year;
      const month = req.query.month;

      query.date = {
        $gte: `${year}-${month}-01`,
        $lte: `${year}-${month}-31`,
      };
    };

    // Handle pagination
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    // Handle sorting
    if (req.query.sort === 'Ascending') {
      sort = { date: 1 };
    } else {
      sort = { date: -1 };
    };

    const holiday = await Holiday.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    };

    // Calculate total count
    const total = await Holiday.countDocuments(query);

    res.status(200).json({ success: true, holiday, totalCount: total });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  };
};

// Get a single holiday by ID
export const fetchSingleHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const holiday = await Holiday.findById(id);

    if (!holiday) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    };
    res.status(200).json({ success: true, holiday });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  };
};

// Update a holiday
export const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, date } = req.body;

    if (!reason || !date) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    };

    const holiday = await Holiday.findById(id);

    if (!holiday) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    };

    holiday.reason = reason;
    holiday.date = date;

    await holiday.save();

    res.status(200).json({ success: true, message: "Holiday updated successfully", holiday });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  };
};

// Delete a holiday
export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findById(id);

    if (!holiday) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    };

    res.status(200).json({ success: true, message: "Holiday deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  };
};