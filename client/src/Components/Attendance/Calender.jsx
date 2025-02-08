/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const Calender = ({ attendanceData, month, year, employeeId }) => {
  const [calendarDays, setCalendarDays] = useState([]);
  const zeroBasedMonth = parseInt(month, 10) - 1;
  const location = useLocation();
  const currentPath = location.pathname;

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
    border: '1px solid #ddd',
    padding: '0.625rem',
    textAlign: 'center',
    background: '#fff',
  };

  const headerStyle = {
    border: '1px solid #ddd',
    textAlign: 'center',
    fontWeight: 'bold',
    background: '#f4f8f4',
    padding: '0.625rem',
  };

  const attendanceColors = {
    Present: 'green',
    Absent: 'red',
    Holiday: '#ffb300',
    Sunday: 'blue',
    'On Leave': 'purple',
    'Comp Off': 'orange',
    'Half Day': '#00ced1',
    default: 'black',
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} style={headerStyle}>{day}</div>
        ))}

        {calendarDays.map((day, index) => {
          if (!day) return <div key={index} style={calendarStyle} />;
          const attendance = getAttendance(day);
          return (
            <div key={index} style={calendarStyle}>
              <div>{day}</div>
              <div style={{ color: attendanceColors[attendance?.status] }}>{attendance?.status}</div>
              {currentPath === "/attendance" && (
                <>
                  <div>{attendance?.punchInTime} {" "} {attendance?.punchOutTime}</div>
                  <div>{attendance?.hoursWorked}</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Calender;
