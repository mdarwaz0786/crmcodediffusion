/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from '../../Preloader.jsx';
const base_url = import.meta.env.VITE_API_BASE_URL;

const HolidayUpload = () => {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a file first.');
      return;
    };

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${base_url}/api/v1/holiday/upload-holiday`, formData, {
        headers: {
          Authorization: validToken,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response?.data?.success) {
        setFile(null);
        toast.success("Submitted successfully");
        navigate(-1);
      };
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error while uploading the file.');
    };
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (team?.role?.name?.toLowerCase() !== "admin" && team?.role?.name?.toLowerCase() !== "hr") {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Upload Holiday</h4>
          <Link to="#" onClick={() => navigate(-1)}>
            <button className="btn btn-primary">Back</button>
          </Link>
        </div>
        <div className="row">
          <div className="col-md-12">
            <label htmlFor="fileInput" className="form-label">Choose an Excel file <span className="text-danger">*</span></label>
            <input
              type="file"
              accept=".xls, .xlsx"
              className="form-control"
              id="fileInput"
              onChange={handleFileChange}
            />
          </div>
        </div>
        {/* Submit Button */}
        <div className="submit-button text-end">
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={handleSubmit}>Submit</Link>
        </div>
      </div>
    </div>
  );
};

export default HolidayUpload;
