import Holiday from "../models/holiday.model.js";
import XLSX from 'xlsx';

// Create or update holiday based on date
export const createHoliday = async (req, res) => {
  try {
    const { reason, type, date } = req.body;
    const company = req.company;

    if (!reason) {
      return res.status(400).json({ success: false, message: "Reason is required" });
    };

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required" });
    };

    // Check if a holiday already exists with the same date
    const existingHoliday = await Holiday.findOne({ date: date, company: req.company });

    if (existingHoliday) {
      existingHoliday.reason = reason;
      await existingHoliday.save();
      return res.status(200).json({ success: true, holiday: existingHoliday });
    } else {
      const newHoliday = new Holiday({ reason, type, date, company });
      await newHoliday.save();
      return res.status(201).json({ success: true, holiday: newHoliday });
    };
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Upload multiple holidays via Excel
export const uploadHolidays = async (req, res) => {
  try {
    const company = req.company;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an Excel file" });
    };

    const allowedExtensions = ['xls', 'xlsx'];
    const fileExtension = req.file.originalname.split('.').pop();

    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({ success: false, message: "Only Excel files are allowed." });
    };

    // Proceed with Excel processing if valid
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    if (!sheetData.length) {
      return res.status(400).json({ success: false, message: "Excel file is empty" });
    };

    // Function to convert Excel date and dd-mm-yyyy string to yyyy-mm-dd format
    const convertToDBDateFormat = (date) => {
      if (typeof date === 'number') {
        const convertedDate = XLSX.SSF.parse_date_code(date);
        const year = convertedDate.y;
        const month = String(convertedDate.m).padStart(2, '0');
        const day = String(convertedDate.d).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } else if (typeof date === 'string' && date.includes('-')) {
        const [day, month, year] = date.split('-');
        return `${year}-${month}-${day}`;
      };
      return date;
    };

    const holidays = sheetData.map((item) => ({
      reason: item.reason.trim(),
      type: item.type.trim() || "Holiday",
      date: convertToDBDateFormat(item.date),
    }));

    const invalidRows = holidays.filter((holiday) => !holiday.reason || !holiday.date);

    if (invalidRows.length > 0) {
      return res.status(400).json({ success: false, message: `All fields (reason and date) are required` });
    };

    // Insert or update holidays if exits
    const promises = holidays.map(async (holiday) => {
      const { date, reason, type } = holiday;
      const existingHoliday = await Holiday.findOne({ date: date, company: req.company });
      if (existingHoliday) {
        existingHoliday.reason = reason;
        await existingHoliday.save();
      } else {
        await Holiday.create({ reason, type, date, company });
      };
    });

    // Wait for all promises to complete
    await Promise.all(promises);

    return res.status(200).json({ success: true, holiday: holidays });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get all upcoming holidays
export const fetchUpcomingHoliday = async (req, res) => {
  try {
    const currentDate = new Date().toISOString().split("T")[0];

    const holiday = await Holiday
      .find({ date: { $gte: currentDate }, company: req.company })
      .sort({ date: 1 })
      .exec();

    return res.status(200).json({ success: true, holiday });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Group holiday by month
export const getHolidaysByMonth = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();

    const holidaysByMonth = await Holiday.aggregate([
      {
        $match: {
          date: { $regex: `^${year}-` },
          company: req.company,
        },
      },
      {
        $addFields: {
          monthNumber: { $toInt: { $substr: ["$date", 5, 2] } },
        },
      },
      {
        $addFields: {
          monthName: {
            $arrayElemAt: [
              [
                "",
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ],
              "$monthNumber",
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            monthName: "$monthName",
            monthNumber: "$monthNumber",
          },
          holidays: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $sort: { "_id.monthNumber": 1 },
      },
      {
        $project: {
          _id: 0,
          monthName: "$_id.monthName",
          monthNumber: "$_id.monthNumber",
          holidays: 1,
        },
      },
    ]);

    return res.status(200).json({ success: true, data: holidaysByMonth });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get all holidays
export const fetchAllHoliday = async (req, res) => {
  try {

    console.log(req.company)
    let query = { company: req.company };
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

    // Search by reason field
    if (req.query.search) {
      const searchQuerey = req.query.search.trim();
      query.reason = { $regex: searchQuerey, $options: "i" };
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

    const holiday = await Holiday
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    };

    // Calculate total count
    const total = await Holiday.countDocuments(query);

    return res.status(200).json({ success: true, holiday, totalCount: total });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get a single holiday by ID
export const fetchSingleHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const holiday = await Holiday.findOne({ _id: id, company: req.company });

    if (!holiday) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    };

    return res.status(200).json({ success: true, holiday });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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

    const holiday = await Holiday.findOne({ _id: id, company: req.company });

    if (!holiday) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    };

    holiday.reason = reason;
    holiday.date = date;

    await holiday.save();

    return res.status(200).json({ success: true, holiday });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Delete a holiday
export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findOne({ _id: id, company: req.company });

    if (!holiday) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    };

    return res.status(200).json({ success: true, message: "Holiday deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};