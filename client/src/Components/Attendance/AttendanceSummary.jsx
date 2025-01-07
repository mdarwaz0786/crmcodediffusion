import formatDate from "../../Helper/formatDate";
import formatTimeToHoursMinutes from "../../Helper/formatTimeToHoursMinutes";
import formatTimeWithAmPm from "../../Helper/formatTimeWithAmPm";

/* eslint-disable react/prop-types */
const AttendanceSummary = ({ attendance }) => {
  const summaryStyle = {
    border: '1px solid #ddd',
    borderRadius: '5px',
    padding: '20px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    backgroundColor: '#f9f9f9',
    maxWidth: '600px',
    margin: '20px auto',
  };

  const headerStyle = {
    textAlign: 'center',
    fontSize: '20px',
    marginBottom: '20px',
    color: '#333',
  };

  const itemStyle = {
    marginBottom: '10px',
    fontSize: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid #eee',
    paddingBottom: '5px',
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
      <div style={itemStyle}><span style={boldText}>Company Working Days:</span> <span>{attendance?.companyWorkingDays}</span></div>
      <div style={itemStyle}><span style={boldText}>Company Working Hours:</span> <span>{formatTimeToHoursMinutes(attendance?.companyWorkingHours)}</span></div>
      <div style={itemStyle}><span style={boldText}>Present Days:</span> <span style={highlightStyle}>{attendance?.employeePresentDays}</span></div>
      <div style={itemStyle}><span style={boldText}>Absent Days:</span> <span style={{ color: 'red', fontWeight: 'bold' }}>{attendance?.employeeAbsentDays}</span></div>
      <div style={itemStyle}><span style={boldText}>On Leave Days:</span> <span style={{ color: 'orange', fontWeight: 'bold' }}>{attendance?.employeeLeaveDays}</span></div>
      <div style={itemStyle}><span style={boldText}>Late In Days:</span> <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{attendance?.employeeLateInDays}</span></div>
      <div style={itemStyle}><span style={boldText}>Total Hours Worked:</span> <span>{formatTimeToHoursMinutes(attendance?.employeeWorkingHours)}</span></div>
      <div style={itemStyle}><span style={boldText}>Required Working Hours:</span> <span>{formatTimeToHoursMinutes(attendance?.employeeRequiredWorkingHours)}</span></div>
      <div style={itemStyle}><span style={boldText}>Average Punch In Time:</span> <span>{formatTimeWithAmPm(attendance?.averagePunchInTime)}</span></div>
      <div style={itemStyle}><span style={boldText}>Average Punch Out Time:</span> <span>{formatTimeWithAmPm(attendance?.averagePunchOutTime)}</span></div>
    </div>
  );
};

export default AttendanceSummary;
