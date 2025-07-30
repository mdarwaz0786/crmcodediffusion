/* eslint-disable react/prop-types */
import formatDate from "../../Helper/formatDate";
import formatTimeToHoursMinutes from "../../Helper/formatTimeToHoursMinutes";
import formatTimeWithAmPm from "../../Helper/formatTimeWithAmPm";

const AttendanceSummary = ({ attendance }) => {
  const summaryStyle = {
    border: '1px solid #ddd',
    borderRadius: '0.3125rem',
    padding: '1.25rem',
    background: '#f4f8f4',
    maxWidth: '40rem',
    margin: '1.25rem auto',
  };

  const headerStyle = {
    textAlign: 'center',
    fontSize: '1.15rem',
    marginBottom: '1.25rem',
    color: '#333',
  };

  const itemStyle = {
    marginBottom: '0.625rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    paddingBottom: '0.6rem',
  };

  const boldText = {
    fontWeight: '500',
    color: '#555',
  };

  const highlightStyle = {
    color: '#007bff',
    fontWeight: '500',
  };

  return (
    <div style={summaryStyle} className="attendance-summary">
      <h4 style={headerStyle}>Attendance Summary</h4>
      <div style={itemStyle}><span style={boldText}>Month:</span> <span>{formatDate(attendance?.month)}</span></div>
      <div style={itemStyle}><span style={boldText}>Total Days in Month:</span> <span>{attendance?.totalDaysInMonth}</span></div>
      <div style={itemStyle}><span style={boldText}>Total Holidays:</span> <span>{attendance?.totalHolidays}</span></div>
      <div style={itemStyle}><span style={boldText}>Total Sundays:</span> <span>{attendance?.totalSundays}</span></div>
      <div style={itemStyle}><span style={boldText}>Company&apos;s Working Days:</span> <span>{attendance?.companyWorkingDays}</span></div>
      <div style={itemStyle}><span style={boldText}>Company&apos;s Working Hours:</span> <span>{formatTimeToHoursMinutes(attendance?.companyWorkingHours)}</span></div>
      <div style={itemStyle}><span style={boldText}>Present Days:</span> <span style={highlightStyle}>{attendance?.employeePresentDays}</span></div>
      <div style={itemStyle}><span style={boldText}>Half Days:</span> <span style={highlightStyle}>{attendance?.employeeHalfDays}</span></div>
      <div style={itemStyle}><span style={boldText}>Comp Off Days:</span> <span style={highlightStyle}>{attendance?.employeeCompOffDays}</span></div>
      <div style={itemStyle}><span style={boldText}>Absent Days:</span> <span style={{ color: 'red', fontWeight: 'bold' }}>{attendance?.employeeAbsentDays}</span></div>
      <div style={itemStyle}><span style={boldText}>On Leave Days:</span> <span style={{ color: 'orange', fontWeight: 'bold' }}>{attendance?.employeeLeaveDays}</span></div>
      <div style={itemStyle}><span style={boldText}>Late In Days:</span> <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{attendance?.employeeLateInDays}</span></div>
      <div style={itemStyle}><span style={boldText}>Total Hours Worked:</span> <span>{formatTimeToHoursMinutes(attendance?.employeeWorkingHours)}</span></div>
      <div style={itemStyle}><span style={boldText}>Total Shortfall Hours:</span> <span>{formatTimeToHoursMinutes(attendance?.employeeShortfallHours)}</span></div>
      <div style={itemStyle}><span style={boldText}>Average Punch In Time:</span> <span>{formatTimeWithAmPm(attendance?.averagePunchInTime)}</span></div>
      <div style={itemStyle}><span style={boldText}>Average Punch Out Time:</span> <span>{formatTimeWithAmPm(attendance?.averagePunchOutTime)}</span></div>
    </div>
  );
};

export default AttendanceSummary;
