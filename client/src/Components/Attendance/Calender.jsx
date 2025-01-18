/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";

const Calender = ({ attendanceData, month, year, employeeId }) => {
  const [calendarDays, setCalendarDays] = useState([]);
  const zeroBasedMonth = parseInt(month, 10) - 1;

  const generateCalendar = () => {
    const daysInMonth = new Date(year, zeroBasedMonth + 1, 0).getDate();
    const firstDay = new Date(year, zeroBasedMonth, 1).getDay();
    const dates = [];

    for (let i = 0; i < firstDay; i++) {
      dates.push(null);
    };

    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(day);
    };

    return dates;
  };

  useEffect(() => {
    setCalendarDays(generateCalendar());
  }, [month, year, employeeId]);

  const getAttendance = (day) => {
    const dateString = `${year}-${(zeroBasedMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const attendance = attendanceData?.find((entry) => entry?.attendanceDate === dateString);
    return attendance;
  };

  const calendarStyle = {
    border: '1px solid #eee',
    padding: '0.625rem',
    textAlign: 'center',
    borderRadius: '0.3125rem',
    cursor: 'pointer',
    background: '#f4f8f4',
  };

  const attendanceColors = {
    Present: 'green',
    Absent: 'red',
    Holiday: '#ffb300',
    Sunday: 'blue',
    'On Leave': 'purple',
    default: 'black',
  };

  return (
    <>
      <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="fw-bold text-center">{day}</div>
        ))}

        {calendarDays.map((day, index) => {
          if (!day) return <div key={index} />;
          const attendance = getAttendance(day);
          return (
            <div key={index} style={calendarStyle} className="text-center">
              <div>{day}</div>
              <div style={{ color: attendanceColors[attendance?.status] }}>{attendance?.status}</div>
              <div>{attendance?.punchInTime} {" "} {attendance?.punchOutTime}</div>
              <div>{attendance?.hoursWorked}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Calender;
