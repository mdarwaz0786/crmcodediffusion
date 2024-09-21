/* eslint-disable no-extra-semi */
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from "../../../context/authContext.jsx";
import Preloader from '../../../Preloader.jsx';

const AddProjectTiming = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();
  const permissions = team?.role?.permissions?.projectTiming;

  const handleCreate = async (e) => {
    e.preventDefault();
    try {

      // Validation
      if (!name) {
        return toast.error("Enter name");
      };

      const response = await axios.post("/api/v1/projectTiming/create-projectTiming", { name, description }, {
        headers: {
          Authorization: `${validToken}`,
        },
      });

      if (response?.data?.success) {
        setName("");
        setDescription("");
        toast.success("Submitted Successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while creating project timing:", error.message);
      toast.error("Error while creating");
    };
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (!permissions?.create) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "1rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Add Project Timeline</h4>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="name">Name <span className="text-danger">*</span></label>
              <input type="text" className="form-control" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div className="col-md-12">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="description">Description <span className="text-danger"></span></label>
              <textarea className="form-control" rows={4} name="description" id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="submit-button text-end">
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={(e) => handleCreate(e)}>Add</Link>
        </div>
      </div>
    </div>
  );
};

export default AddProjectTiming;