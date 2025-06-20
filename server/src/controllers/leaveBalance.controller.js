import Team from "../models/team.model.js";
import LeaveApproval from "../models/leaveApproval.model.js";
import Holiday from "../models/holiday.model.js";

export const leaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Team.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    };

    const leaveSystemStart = new Date("2025-07-01");
    const joinDate = new Date(employee.joining);
    const accrualStart = joinDate > leaveSystemStart
      ? new Date(joinDate.getFullYear(), joinDate.getMonth(), 1)
      : leaveSystemStart;

    const today = new Date();
    if (today < accrualStart) {
      return res.json({
        summary: [],
        totalEntitled: 0,
        totalTaken: 0,
        balance: 0,
      });
    };

    // Load all holidays into a Set for fast lookup
    const holidays = await Holiday.find({});
    const holidaySet = new Set(holidays.map(h => new Date(h.date).toDateString())); // e.g., "Mon Mar 31 2025"

    // Fetch all approved leaves
    const approvedLeaves = await LeaveApproval.find({
      employee: employeeId,
      leaveStatus: "Approved",
      startDate: { $gte: accrualStart.toISOString().split("T")[0] },
    });

    const leaveByMonth = {};

    approvedLeaves.forEach((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      let current = new Date(start);

      while (current <= end) {
        const isSunday = current.getDay() === 0;
        const isHoliday = holidaySet.has(current.toDateString());

        if (!isSunday && !isHoliday) {
          const month = current.toISOString().slice(0, 7); // "YYYY-MM"
          leaveByMonth[month] = (leaveByMonth[month] || 0) + 1;
        };

        current.setDate(current.getDate() + 1);
      };
    });

    // Monthly summary logic
    const summary = [];
    let cursor = new Date(accrualStart);
    let cumulativeTaken = 0;
    let cumulativeAdded = 0;

    while (cursor <= today) {
      const month = cursor.toISOString().slice(0, 7);
      const taken = leaveByMonth[month] || 0;

      cumulativeAdded += 2;
      cumulativeTaken += taken;

      summary.push({
        month,
        leavesAdded: 2,
        leavesTaken: taken,
        balanceTillMonth: cumulativeAdded - cumulativeTaken,
      });

      cursor.setMonth(cursor.getMonth() + 1);
    };

    const totalEntitled = cumulativeAdded;
    const totalTaken = cumulativeTaken;
    const balance = totalEntitled - totalTaken;

    return res.json({
      summary,
      totalEntitled,
      totalTaken,
      balance,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  };
};