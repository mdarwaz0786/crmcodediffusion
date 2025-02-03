/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from '../../Preloader.jsx';
const base_url = import.meta.env.VITE_API_BASE_URL;

const EditHoliday = () => {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();
  const { id } = useParams();

  const fetchHoliday = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/holiday/single-holiday/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });
      if (response?.data?.success) {
        setDate(response.data.holiday.date);
        setReason(response.data.holiday.reason);
      };
    } catch (error) {
      console.log("Error fetching holiday details:", error.message);
    };
  };

  useEffect(() => {
    if (id && validToken && !isLoading && (team?.role?.name?.toLowerCase() === "admin" || team?.role?.name?.toLowerCase() === "hr")) {
      fetchHoliday();
    };
  }, [id, validToken, team, isLoading]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      if (!date || !reason) {
        return toast.error("Please fill all fields");
      };

      const response = await axios.put(`${base_url}/api/v1/holiday/update-holiday/${id}`,
        { date, reason },
        {
          headers: {
            Authorization: validToken,
          },
        },
      );

      if (response?.data?.success) {
        setReason("");
        setDate("");
        toast.success("Submitted successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while updating Holiday:", error.message);
      toast.error("Error while submitting");
    };
  };

  if (isLoading) {
    return <Preloader />;
  }

  if (team?.role?.name?.toLowerCase() !== "admin" && team?.role?.name?.toLowerCase() !== "hr") {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Update Holiday</h4>
          <Link to="#" onClick={() => navigate(-1)}>
            <button className="btn btn-primary">Back</button>
          </Link>
        </div>
        <div className='row'>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="date">Date <span className="text-danger">*</span></label>
              <input className="form-control" type="date" name="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="reason">Reason <span className="text-danger">*</span></label>
              <input className="form-control" type="text" name="reason" id="reason" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="submit-button text-end">
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={handleUpdate}>Update</Link>
        </div>
      </div>
    </div>
  );
};

export default EditHoliday;
