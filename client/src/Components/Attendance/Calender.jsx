/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Button, Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import { useAuth } from "../../context/authContext.jsx";
import { toast } from 'react-toastify';
const base_url = import.meta.env.VITE_API_BASE_URL;
import "./Calender.css";

const Calender = ({ attendanceData, month, year, employeeId, fetchAllData }) => {
  const { validToken } = useAuth();
  const [calendarDays, setCalendarDays] = useState([]);
  const zeroBasedMonth = parseInt(month, 10) - 1;
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [attendanceId, setAttendanceId] = useState('');
  const [punchInTime, setPunchInTime] = useState('');
  const [punchOutTime, setPunchOutTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [attendanceMarking, setAttendanceMarking] = useState(false);
  const [markDate, setMarkDate] = useState('');

  const openModal = (id, punchInTime, punchOutTime) => {
    setAttendanceId(id);
    setPunchInTime(punchInTime || '');
    setPunchOutTime(punchOutTime || '');
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setAttendanceId('');
    setPunchInTime('');
    setPunchOutTime('');
    setAttendanceMarking(false);
    setLoading(false);
    setMarkDate('');
  };

  const handlePunchInTimeChange = (e) => {
    setPunchInTime(e.target.value);
  };

  const handlePunchOutTimeChange = (e) => {
    setPunchOutTime(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(`${base_url}/api/v1/newAttendance/update-punchTime`, {
        id: attendanceId,
        punchInTime,
        punchOutTime,
      },
        {
          headers: {
            Authorization: validToken,
          },
        },
      );

      if (response.data.success) {
        closeModal();
        fetchAllData();
        toast.success("Updated successfully");
      };
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error while updating");
    } finally {
      setLoading(false);
    };
  };

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
    cursor: "pointer",
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

  const handleSetMarkAttendanceDate = (d) => {
    setMarkDate(d);
    setAttendanceMarking(true);
    setModalIsOpen(true);
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();

    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(markDate).padStart(2, '0')}`;

    setLoading(true);

    try {
      const response = await axios.post(`${base_url}/api/v1/newAttendance/mark-attendanceSingleDay`,
        {
          employeeId,
          punchInTime,
          punchOutTime,
          date: formattedDate,
        },
        {
          headers: {
            Authorization: validToken,
          },
        },
      );

      if (response?.data?.success) {
        closeModal();
        fetchAllData();
        toast.success("Attendance marked successfully");
      };
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error while marking attendance");
    } finally {
      setLoading(false);
    };
  };

  return (
    <>
      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div className="calendar-header" key={day} style={headerStyle}>{day}</div>
        ))}

        {calendarDays.map((day, index) => {
          if (!day) return <div key={index} style={calendarStyle} />;
          const attendance = getAttendance(day);
          return (
            <div
              key={index}
              style={calendarStyle}
              onClick={() => attendance?._id ? openModal(attendance?._id, attendance?.punchInTime, attendance?.punchOutTime) : handleSetMarkAttendanceDate(day)}
            >
              <div>{day}</div>
              <div style={{ color: attendanceColors[attendance?.status] }}>{attendance?.status}</div>
              <div>{attendance?.punchInTime} {" "} {attendance?.punchOutTime}</div>
              <div>{attendance?.hoursWorked}</div>
            </div>
          );
        })}
      </div>

      <Modal show={modalIsOpen} onHide={closeModal} size="lg" aria-labelledby="modal-title">
        <Modal.Header closeButton>
          <h5 id="modal-title">{attendanceMarking ? "Mark Attendance" : "Update Punch Time"}</h5>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => attendanceMarking ? handleMarkAttendance(e) : handleSubmit(e)}>
            <div className="row">
              <div className="col-md-6">
                <Form.Group controlId="formPunchInTime">
                  <Form.Label>Punch In Time <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="time"
                    value={punchInTime}
                    onChange={handlePunchInTimeChange}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group controlId="formPunchOutTime">
                  <Form.Label>Punch Out Time <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="time"
                    value={punchOutTime}
                    onChange={handlePunchOutTimeChange}
                  />
                </Form.Group>
              </div>
            </div>

            {
              attendanceMarking ? (
                <div className="d-flex justify-content-between mt-3">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Marking...' : 'Mark'}
                  </Button>
                  <Button variant="secondary" onClick={closeModal}>
                    Close
                  </Button>
                </div>
              ) : (
                <div className="d-flex justify-content-between mt-3">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
                  </Button>
                  <Button variant="secondary" onClick={closeModal}>
                    Close
                  </Button>
                </div>
              )
            }
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Calender;
