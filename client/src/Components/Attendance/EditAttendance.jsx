/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from "../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const EditAttendance = () => {
  const [selectedAttendance, setSelectedAttendance] = useState("");
  const [date, setDate] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [locationName, setLocationName] = useState("");
  const { validToken, team, isLoading } = useAuth();
  const permissions = team?.role?.permissions?.attendance;
  const fieldPermissions = team?.role?.permissions?.attendance?.fields;
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        try {
          const geocodingResponse = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const locationName = geocodingResponse.data?.name;
          setLocationName(locationName);
        } catch (error) {
          console.error("Error while fetching location name:", error.message);
          toast.error("Failed to fetch location name.");
        };
      },
      (error) => {
        console.error('Error while getting location:', error.message);
        toast.error("Failed to detect location. Please check your browser settings.");
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  }, []);

  const fetchSingleAttendance = async (id) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/attendance/single-attendance/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setSelectedAttendance(response?.data?.attendance?.attendance);
        setDate(response?.data?.attendance?.date);
        setCheckInTime(response?.data?.attendance?.checkInTime);
        setCheckOutTime(response?.data?.attendance?.checkOutTime);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.update && id) {
      fetchSingleAttendance(id);
    };
  }, [isLoading, team, permissions, id]);


  const handleUpdate = async (e, id) => {
    e.preventDefault();

    try {
      const response = await axios.put(`${base_url}/api/v1/attendance/update-attendance/${id}`, { attendance: selectedAttendance, date, checkInTime, checkOutTime, location: { ...location, name: locationName } }, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setSelectedAttendance("");
        setCheckInTime("");
        setCheckOutTime("");
        setDate("");
        setLocation({ latitude: null, longitude: null });
        toast.success("Submitted successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while updating attendance:", error.message);
      toast.error("Error while submitting");
    };
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (!permissions?.update) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "1rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Update Attendance</h4>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="row">
          {
            (fieldPermissions?.attendance?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="attendance">Attendance <span className="text-danger">*</span></label>
                  <select className="form-select" name="attendance" id="attendance" value={selectedAttendance} onChange={(e) => setSelectedAttendance(e.target.value)}>
                    <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Half Day">Half Day</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.date?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="date">Date <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" name="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.checkInTime?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="checkInTime">Check In Time <span className="text-danger">*</span></label>
                  <input type="time" className="form-control" name="checkInTime" id="checkInTime" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.checkOutTime?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="checkOutTime">Check Out Time <span className="text-danger">*</span></label>
                  <input type="time" className="form-control" name="checkOutTime" id="checkOutTime" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} />
                </div>
              </div>
            )
          }
        </div>
        <div className="submit-button text-end">
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={(e) => handleUpdate(e, id)}>Submit</Link>
        </div>
      </div>
    </div>
  );
};

export default EditAttendance;