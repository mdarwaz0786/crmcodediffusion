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
    const joinDate = new Date(employee?.joining);

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
    const holidaySet = new Set(holidays?.map((h) => new Date(h?.date).toDateString()));

    // Fetch all approved leaves
    const approvedLeaves = await LeaveApproval.find({
      employee: employeeId,
      leaveStatus: "Approved",
      startDate: { $gte: accrualStart.toISOString().split("T")[0] },
    });

    const leaveByMonth = {};

    approvedLeaves?.forEach((leave) => {
      const start = new Date(leave?.startDate);
      const end = new Date(leave?.endDate);

      while (start <= end) {
        const isSunday = start.getDay() === 0;
        const isHoliday = holidaySet.has(start.toDateString());

        if (!isSunday && !isHoliday) {
          const month = start.toISOString().slice(0, 7);
          const dateStr = start.toISOString().split("T")[0];
          if (!leaveByMonth[month]) {
            leaveByMonth[month] = [];
          };
          leaveByMonth[month].push(dateStr);
        };

        start.setDate(start.getDate() + 1);
      };
    });

    // Monthly summary logic
    const summary = [];
    let cursor = new Date(accrualStart);
    let cumulativeTaken = 0;
    let cumulativeAdded = 0;

    while (cursor <= today) {
      const month = cursor.toISOString().slice(0, 7);
      const leaveDates = leaveByMonth[month] || [];
      const taken = leaveDates.length;

      cumulativeAdded += 2;
      cumulativeTaken += taken;

      summary.push({
        month,
        leavesAdded: 2,
        leavesTaken: taken,
        balanceTillMonth: cumulativeAdded - cumulativeTaken,
        leaveDates,
      });

      cursor.setMonth(cursor.getMonth() + 1);
    };

    const totalEntitled = cumulativeAdded;
    const totalTaken = cumulativeTaken;
    const balance = totalEntitled - totalTaken;

    return res.json({
      success: true,
      summary,
      totalEntitled,
      totalTaken,
      balance,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  };
};