import Attendance from '../models/attendance.model.js';
import Team from "../models/team.model.js";
import Holiday from "../models/holiday.model.js";
import mongoose from "mongoose";
import firebase from "../firebase/index.js";
import { getDatesBetween } from '../utils/getDatesBetween.js';

// Calculate time difference in HH:MM format
const calculateTimeDifference = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return;
  };

  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  const differenceMinutes = Math.max(endTotalMinutes - startTotalMinutes, 0);
  const hours = Math.floor(differenceMinutes / 60);
  const minutes = differenceMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// Helper function to compare two times
function compareTime(time1, time2) {
  if (!time1 || !time2) {
    return;
  };

  const [hours1, minutes1] = time1.split(":").map(Number);
  const [hours2, minutes2] = time2.split(":").map(Number);

  if (hours1 > hours2 || (hours1 === hours2 && minutes1 > minutes2)) {
    return 1;
  };

  if (hours1 === hours2 && minutes1 === minutes2) {
    return 0;
  };

  return -1;
};

// Helper function to convert time (HH:MM) into minutes
function timeToMinutes(time) {
  if (!time) {
    return;
  };

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper function to convert minutes into time (HH:MM)
function minutesToTime(minutes) {
  if (!minutes) {
    return;
  };

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

// Helper function to get the day name from a date string
const getDayName = (dateString) => {
  if (!dateString) {
    return;
  };

  const date = new Date(dateString);
  const options = { weekday: 'long' };
  return date.toLocaleDateString('en-US', options);
};

// Function to convert UTC date to IST
const convertToIST = (date) => {
  if (!date) {
    return;
  };

  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  return new Date(date.getTime() + IST_OFFSET);
};

// Create or Update Attendance with Punch-in
export const newCreateAttendance = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { employee, attendanceDate, punchInTime, punchInLatitude, punchInLongitude } = req.body;

    if (!employee) {
      return res.status(400).json({ success: false, message: "Employee is required" });
    };

    if (!attendanceDate) {
      return res.status(400).json({ success: false, message: "Attendance Date is required" });
    };

    if (!punchInTime) {
      return res.status(400).json({ success: false, message: "Punch in time is required" });
    };

    const EXPECTED_PUNCH_IN = "10:00";
    const HALF_DAY_THRESHOLD = "11:00";

    // Calculate lateIn
    const lateIn = calculateTimeDifference(EXPECTED_PUNCH_IN, punchInTime);

    // Determine attendance status based on punch-in time
    const attendanceStatus = compareTime(punchInTime, HALF_DAY_THRESHOLD) === 1 ? "Half Day" : "Present";

    // Check if the attendance date is a holiday
    const holiday = await Holiday.findOne({ date: attendanceDate }).session(session);

    // Get the day name from attendanceDate
    const dayName = getDayName(attendanceDate);

    // Upsert attendance record with atomic operation
    const result = await Attendance.findOneAndUpdate(
      { employee, attendanceDate, punchIn: false },
      {
        $set: {
          punchInLatitude,
          punchInLongitude,
          punchInTime,
          punchIn: true,
          status: attendanceStatus,
          lateIn,
          dayName,
          isHoliday: holiday ? true : false,
        },
      },
      {
        upsert: true,
        new: true,
      },
    ).session(session);

    // Check if the day is Sunday or if it is a holiday
    if (dayName === "Sunday" || holiday) {
      let reason = "";

      // If both conditions are true
      if (dayName === "Sunday" && holiday) {
        reason = `Worked on ${dayName}, ${holiday.reason}`;
      } else if (dayName === "Sunday") {
        reason = `Worked on ${dayName}`;
      } else if (holiday) {
        reason = `Worked on ${holiday.reason}`;
      };

      const compOffEntry = {
        date: attendanceDate,
        isApplied: false,
        isApproved: false,
        isUtilized: false,
        reason,
      };

      // Update the eligibleCompOffDate
      await Team.findOneAndUpdate(
        { _id: employee },
        { $addToSet: { eligibleCompOffDate: compOffEntry } },
      ).session(session);
    };

    const sendBy = await Team.findById(employee);

    // Send push notification to admin
    const teams = await Team
      .find()
      .populate({ path: 'role', select: "name" })
      .exec();

    const filteredAdmins = teams?.filter((team) => team?.role?.name?.toLowerCase() === "admin");

    if (filteredAdmins?.length > 0) {
      const payload = {
        notification: {
          title: `${sendBy?.name} Punched-In`,
          body: `${sendBy?.name} marked punch-in today at ${punchInTime}.`,
        },
      };

      await Promise.allSettled(filteredAdmins?.map((admin) => firebase.messaging().send({ ...payload, token: admin?.fcmToken })));
    };

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ success: true, attendance: result });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  };
};

export const markAttendanceDateRange = async (req, res) => {
  try {
    const { employeeId, punchInTime, punchOutTime, fromDate, toDate } = req.body;

    if (!employeeId || !punchInTime || !punchOutTime || !fromDate || !toDate) {
      return res.status(400).json({ success: false, message: "All fields are required." })
    };

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    const isValidTime = (time) => {
      return timeRegex.test(time);
    };

    const isValidDate = (date) => {
      return dateRegex.test(date) && !isNaN(new Date(date).getTime());
    };

    if (!isValidTime(punchInTime)) {
      return res.status(400).json({ error: "Invalid punch in time format. Expected HH:MM." });
    };

    if (!isValidTime(punchOutTime)) {
      return res.status(400).json({ error: "Invalid punch out time format. Expected HH:MM." });
    };

    if (!isValidDate(fromDate)) {
      return res.status(400).json({ error: "Invalid from date format. Expected YYYY-MM-DD." });
    };

    if (!isValidDate(toDate)) {
      return res.status(400).json({ error: "Invalid to date format. Expected YYYY-MM-DD." });
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (from > today) {
      return res.status(400).json({ success: false, message: "From date cannot be in the future." });
    };

    if (to > today) {
      return res.status(400).json({ success: false, message: "To date cannot be in the future." });
    };

    const employee = await Team.findOne({ _id: employeeId }).populate("office");

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found." });
    };

    const dates = getDatesBetween(fromDate, toDate);

    if (dates.length === 0) {
      return res.status(404).json({ success: false, message: "Provide from date and to date." });
    };

    for (let i = 0; i < dates.length; i++) {
      if (new Date(dates[i]).getDay() === 0) {
        continue;
      };

      const holiday = await Holiday.findOne({ date: dates[i] });

      if (holiday) {
        continue;
      };

      const existingAttendance = await Attendance.findOne({ attendanceDate: dates[i] });

      if (existingAttendance) {
        continue;
      };

      const EXPECTED_PUNCH_IN = "10:00";
      const HALF_DAY_THRESHOLD = "11:00";
      const lateIn = calculateTimeDifference(EXPECTED_PUNCH_IN, punchInTime);
      const attendanceStatus = compareTime(punchInTime, HALF_DAY_THRESHOLD) === 1 ? "Half Day" : "Present";
      const dayName = getDayName(dates[i]);
      const hoursWorked = calculateTimeDifference(punchInTime, punchOutTime);
      const officeLatitude = employee?.office?.latitude;
      const officeLongitude = employee?.office?.longitude;

      const newAttendance = new Attendance({
        employee: employeeId,
        attendanceDate: dates[i],
        punchInLatitude: officeLatitude,
        punchInLongitude: officeLongitude,
        punchOutLatitude: officeLatitude,
        punchOutLongitude: officeLongitude,
        status: attendanceStatus,
        punchInTime: punchInTime,
        punchIn: true,
        punchOutTime: punchOutTime,
        punchOut: true,
        lateIn: lateIn,
        hoursWorked: hoursWorked,
        dayName: dayName,
        isHoliday: false,
      });

      await newAttendance.save();
    };

    return res.status(201).json({ success: true, message: `Attendance successfully marked from date ${fromDate} to date ${toDate}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get all attendance
export const newFetchAllAttendance = async (req, res) => {
  try {
    const { date, employeeId } = req.query;
    let query = {};
    let sort = {};

    // Filter by exact date
    if (date) {
      query.attendanceDate = date;
    };

    // Filter by year only (all months)
    if (req.query.year && !req.query.month) {
      const year = req.query.year;
      query.attendanceDate = {
        $gte: `${year}-01-01`,
        $lte: `${year}-12-31`,
      };
    };

    // Filter by month only (all years)
    if (req.query.month && !req.query.year) {
      const month = req.query.month;
      query.attendanceDate = { $regex: `-${month}-`, $options: "i" };
    };

    // Filter by both year and month
    if (req.query.year && req.query.month) {
      const year = req.query.year;
      const month = req.query.month;

      query.attendanceDate = {
        $gte: `${year}-${month}-01`,
        $lte: `${year}-${month}-31`,
      };
    };

    // Filter by employee ID if provided
    if (employeeId) {
      query.employee = employeeId;
    };

    // Handle sorting
    if (req.query.sort === 'Ascending') {
      sort = { attendanceDate: 1 };
    } else {
      sort = { attendanceDate: -1 };
    };

    // Calculate total count
    const totalCount = await Attendance.countDocuments(query);

    // Fetch attendance with the constructed query
    const attendance = await Attendance
      .find(query)
      .sort(sort)
      .populate('employee')
      .exec();

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance not found' });
    };

    return res.status(200).json({ success: true, attendance, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Fetch monthly statistic
export const newFetchMonthlyStatistic = async (req, res) => {
  try {
    const { employeeId, month } = req.query;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: "Employee Id is required." });
    };

    if (!month) {
      return res.status(400).json({ success: false, message: "Month in YYYY-MM format is required." });
    };

    const employee = await Team
      .findOne({ _id: employeeId })
      .select("workingHoursPerDay approvedLeaves eligibleCompOffDate");

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found." });
    };

    let [requiredHours, requiredMinutes] = employee?.workingHoursPerDay?.split(":")?.map(Number);
    let dailyThreshold = requiredHours * 60 + requiredMinutes;

    let [year, monthIndex] = month?.split("-")?.map(Number);
    let totalDaysInMonth = new Date(year, monthIndex, 0).getDate();

    let calendarData = [];

    let totalPresent = 0;
    let totalHalfDays = 0;
    let totalAbsent = 0;
    let totalOnLeave = 0;
    let totalHolidays = 0;
    let totalSundays = 0;
    let totalMinutesWorked = 0;
    let totalLateIn = 0;
    let totalCompOff = 0;

    let totalPunchInMinutes = 0;
    let punchInCount = 0;
    let averagePunchInTime = 0;
    let totalPunchOutMinutes = 0;
    let punchOutCount = 0;
    let averagePunchOutTime = 0;

    for (let day = 1; day <= totalDaysInMonth; day++) {
      let _id = "";
      let status = "";
      let punchInTime = "";
      let punchOutTime = "";
      let hoursWorked = "";
      let lateIn = "";

      let date = new Date(year, monthIndex - 1, day);
      let formattedDate = convertToIST(date).toISOString().split("T")[0];
      let currentDate = convertToIST(new Date()).toISOString().split("T")[0];

      if (formattedDate > currentDate) {
      } else if (date.getDay() === 0) {
        let attendanceRecord = await Attendance.findOne({
          employee: employeeId,
          attendanceDate: formattedDate,
          status: { $in: ["Present", "Half Day"] },
        }).select("_id attendanceDate status punchInTime punchOutTime hoursWorked lateIn");
        if (attendanceRecord) {
          _id = attendanceRecord?._id;
          status = attendanceRecord?.status;
          punchInTime = attendanceRecord?.punchInTime;
          punchOutTime = attendanceRecord?.punchOutTime;
          hoursWorked = attendanceRecord?.hoursWorked;
          lateIn = attendanceRecord?.lateIn;
          if (attendanceRecord?.status === "Present") {
            totalPresent++
          };
          if (attendanceRecord?.status === "Half Day") {
            totalHalfDays++;
          };
          if (attendanceRecord?.hoursWorked) {
            totalMinutesWorked += timeToMinutes(attendanceRecord?.hoursWorked);
          };
          if (attendanceRecord?.lateIn !== "00:00") {
            totalLateIn++;
          };
          if (attendanceRecord?.punchInTime) {
            totalPunchInMinutes += timeToMinutes(attendanceRecord?.punchInTime);
            punchInCount++;
          };
          if (attendanceRecord?.punchOutTime) {
            totalPunchOutMinutes += timeToMinutes(attendanceRecord?.punchOutTime);
            punchOutCount++;
          };
        } else {
          status = "Sunday";
          totalSundays++;
        };
      } else {
        let holiday = await Holiday.findOne({ date: formattedDate });
        let leaveRecord = employee?.approvedLeaves?.some((leave) => leave?.date === formattedDate);
        let compOffRecord = employee?.eligibleCompOffDate?.some((comp) => comp?.compOffDate === formattedDate);
        if (holiday) {
          let attendanceRecord = await Attendance.findOne({
            employee: employeeId,
            attendanceDate: formattedDate,
            status: { $in: ["Present", "Half Day"] },
          }).select("_id attendanceDate status punchInTime punchOutTime hoursWorked lateIn");
          if (attendanceRecord) {
            _id = attendanceRecord?._id;
            status = attendanceRecord?.status;
            punchInTime = attendanceRecord?.punchInTime;
            punchOutTime = attendanceRecord?.punchOutTime;
            hoursWorked = attendanceRecord?.hoursWorked;
            lateIn = attendanceRecord?.lateIn;
            if (attendanceRecord?.status === "Present") {
              totalPresent++
            };
            if (attendanceRecord?.status === "Half Day") {
              totalHalfDays++;
            };
            if (attendanceRecord?.hoursWorked) {
              totalMinutesWorked += timeToMinutes(attendanceRecord?.hoursWorked);
            };
            if (attendanceRecord?.lateIn !== "00:00") {
              totalLateIn++;
            };
            if (attendanceRecord?.punchInTime) {
              totalPunchInMinutes += timeToMinutes(attendanceRecord?.punchInTime);
              punchInCount++;
            };
            if (attendanceRecord?.punchOutTime) {
              totalPunchOutMinutes += timeToMinutes(attendanceRecord?.punchOutTime);
              punchOutCount++;
            };
          } else {
            status = "Holiday";
            totalHolidays++;
          };
        } else if (compOffRecord) {
          status = "Comp Off";
          totalCompOff++;
        } else if (leaveRecord) {
          status = "On Leave";
          totalOnLeave++;
        } else {
          let attendanceRecord = await Attendance.findOne({
            employee: employeeId,
            attendanceDate: formattedDate,
            status: { $in: ["Present", "Half Day"] },
          }).select("_id attendanceDate status punchInTime punchOutTime hoursWorked lateIn");
          if (attendanceRecord) {
            _id = attendanceRecord?._id;
            status = attendanceRecord?.status;
            punchInTime = attendanceRecord?.punchInTime;
            punchOutTime = attendanceRecord?.punchOutTime;
            hoursWorked = attendanceRecord?.hoursWorked;
            lateIn = attendanceRecord?.lateIn;
            if (attendanceRecord?.status === "Present") {
              totalPresent++;
            };
            if (attendanceRecord?.status === "Half Day") {
              totalHalfDays++;
            };
            if (attendanceRecord?.hoursWorked) {
              totalMinutesWorked += timeToMinutes(attendanceRecord?.hoursWorked);
            };
            if (attendanceRecord?.lateIn !== "00:00") {
              totalLateIn++;
            };
            if (attendanceRecord?.punchInTime) {
              totalPunchInMinutes += timeToMinutes(attendanceRecord?.punchInTime);
              punchInCount++;
            };
            if (attendanceRecord?.punchOutTime) {
              totalPunchOutMinutes += timeToMinutes(attendanceRecord?.punchOutTime);
              punchOutCount++;
            };
          } else {
            status = "Absent";
            totalAbsent++;
          };
        };
      };

      let attendanceObject = {
        attendanceDate: formattedDate,
        status: status,
      };

      if (_id) {
        attendanceObject._id = _id;
      };

      if (punchInTime) {
        attendanceObject.punchInTime = punchInTime;
      };

      if (punchOutTime) {
        attendanceObject.punchOutTime = punchOutTime;
      };

      if (hoursWorked) {
        attendanceObject.hoursWorked = hoursWorked;
      };

      if (lateIn) {
        attendanceObject.lateIn = lateIn;
      };

      calendarData.push(attendanceObject);
    };

    let companyWorkingDays = totalDaysInMonth - (totalHolidays + totalSundays + totalCompOff);
    let companyWorkingHours = minutesToTime(companyWorkingDays * dailyThreshold);

    let requiredWorkingHours = minutesToTime((totalPresent + totalHalfDays) * dailyThreshold);

    averagePunchInTime = punchInCount
      ? minutesToTime(Math.floor(totalPunchInMinutes / punchInCount))
      : null;

    averagePunchOutTime = punchOutCount
      ? minutesToTime(Math.floor(totalPunchOutMinutes / punchOutCount))
      : null;

    const monthlyStatics = {
      employee: employeeId,
      month,
      totalDaysInMonth,
      companyWorkingDays,
      companyWorkingHours,
      totalHolidays,
      totalSundays,
      employeePresentDays: totalPresent,
      employeeHalfDays: totalHalfDays,
      employeeAbsentDays: totalAbsent,
      employeeLeaveDays: totalOnLeave,
      employeeCompOffDays: totalCompOff,
      employeeWorkingHours: minutesToTime(totalMinutesWorked),
      employeeRequiredWorkingHours: requiredWorkingHours,
      employeeLateInDays: totalLateIn,
      averagePunchInTime,
      averagePunchOutTime,
    };

    return res.status(200).json({ success: true, calendarData, monthlyStatics });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Get a single attendance record by ID
export const newFetchSingleAttendance = async (req, res) => {
  try {
    const attendance = await Attendance
      .findById(req.params.id)
      .populate('employee')
      .exec();

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance not found' });
    };

    return res.status(200).json({ success: true, attendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Update attendance with punch-out
export const newUpdateAttendance = async (req, res) => {
  try {
    const { employee, attendanceDate, punchOutTime, punchOutLatitude, punchOutLongitude } = req.body;

    if (!employee) {
      return res.status(400).json({ success: false, message: "Employee is required" });
    };

    if (!attendanceDate) {
      return res.status(400).json({ success: false, message: "Date is required" });
    };

    if (!punchOutTime) {
      return res.status(400).json({ success: false, message: "Punch out time is required" });
    };

    // Find punch in record
    const attendance = await Attendance.findOne({
      employee,
      attendanceDate,
      punchIn: true,
    });

    if (!attendance) {
      return res.status(400).json({ success: false, message: `Punch in not found for date ${attendanceDate}` });
    };

    if (attendance?.punchInTime === punchOutTime) {
      return res.status(400).json({ success: false, message: `There should be atleast 1 minute gap between punch in and punch out` });
    };

    // Update punch out details
    const updatedAttendance = await Attendance.findOneAndUpdate(
      { _id: attendance?._id },
      {
        $set: {
          punchOutLatitude,
          punchOutLongitude,
          punchOutTime,
          punchOut: true,
          hoursWorked: calculateTimeDifference(attendance?.punchInTime, punchOutTime),
        },
      },
      {
        new: true,
        upsert: true,
      },
    );

    const sendBy = await Team.findById(employee);

    // Send push notification to admin
    const teams = await Team
      .find()
      .populate({ path: 'role', select: "name" })
      .exec();

    const filteredAdmins = teams?.filter((team) => team?.role?.name?.toLowerCase() === "admin");

    if (filteredAdmins?.length > 0) {
      const payload = {
        notification: {
          title: `${sendBy?.name} Punched-Out`,
          body: `${sendBy?.name} marked punch-out today at ${punchOutTime}.`,
        },
      };

      await Promise.allSettled(filteredAdmins?.map((admin) => firebase.messaging().send({ ...payload, token: admin?.fcmToken })));
    };

    return res.status(200).json({ success: true, attendance: updatedAttendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Update punch times in attendance
export const newUpdatePunchTimeAttendance = async (req, res) => {
  try {
    const { id, punchOutTime, punchInTime } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Attendance id is required." });
    };

    if (!punchInTime && !punchOutTime) {
      return res.status(400).json({ success: false, message: "At least one punch time is required." });
    };

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return res.status(404).json({ success: false, message: `Attendance not found with id ${id}` });
    };

    const EXPECTED_PUNCH_IN = "10:00";
    const HALF_DAY_THRESHOLD = "11:00";

    const lateIn = calculateTimeDifference(EXPECTED_PUNCH_IN, punchInTime);

    const attendanceStatus = compareTime(punchInTime, HALF_DAY_THRESHOLD) === 1 ? "Half Day" : "Present";

    let updateFields = { lateIn, status: attendanceStatus };

    if (punchInTime) {
      updateFields.punchInTime = punchInTime;
      updateFields.punchIn = true;
    };

    if (punchOutTime) {
      updateFields.punchOutTime = punchOutTime;
      updateFields.punchOut = true;
    };

    if (punchInTime && punchOutTime) {
      updateFields.hoursWorked = calculateTimeDifference(punchInTime, punchOutTime);
    };

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true },
    );

    return res.status(200).json({ success: true, attendance: updatedAttendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Delete an attendance record by ID
export const newDeleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance not found' });
    };

    return res.status(204).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};
