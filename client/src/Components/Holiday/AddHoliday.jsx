/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from '../../Preloader.jsx';
const base_url = import.meta.env.VITE_API_BASE_URL;

const AddHoliday = () => {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      if (!date || !reason) {
        return toast.error("Please fill all fields");
      };

      const response = await axios.post(`${base_url}/api/v1/Holiday/create-Holiday`,
        { date, reason },
        {
          headers: {
            Authorization: validToken,
          },
        },
      );

      if (response?.data?.success) {
        setDate("");
        setReason("");
        toast.success("Submitted successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while creating Holiday:", error.message);
      toast.error("Error while submitting");
    };
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (team?.role?.name.toLowerCase() !== "admin" && team?.role?.name.toLowerCase() !== "hr") {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Add Holiday</h4>
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

        {/* Submit Button */}
        <div className="submit-button text-end">
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={handleCreate}>Submit</Link>
        </div>
      </div>
    </div>
  );
};

export default AddHoliday;
