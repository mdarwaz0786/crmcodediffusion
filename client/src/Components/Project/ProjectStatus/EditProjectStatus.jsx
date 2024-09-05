/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../../context/authContext.jsx";
import Preloader from "../../../Preloader.jsx";

const EditProjectStatus = () => {
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();
  const fieldPermissions = team?.role?.permissions?.projectStatus?.fields;
  const permissions = team?.role?.permissions?.projectStatus;

  const fetchSingleData = async (id) => {
    try {
      const response = await axios.get(`/api/v1/projectStatus/single-projectStatus/${id}`, {
        headers: {
          Authorization: `${validToken}`,
        },
      });

      if (response?.data?.success) {
        setStatus(response?.data?.projectStatus?.status);
        setDescription(response?.data?.projectStatus?.description);
      };
    } catch (error) {
      console.log("Error while fetching single project status:", error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.update && id) {
      fetchSingleData(id);
    };
  }, [id, isLoading, team, permissions]);

  const handleUpdate = async (e, id) => {
    e.preventDefault();

    // Create update object
    const updateData = {};

    // Conditionally include fields based on permissions
    if (fieldPermissions?.status?.show && !fieldPermissions?.status?.read) {
      updateData.status = status;
    };

    if (fieldPermissions?.description?.show && !fieldPermissions?.description?.read) {
      updateData.description = description;
    };

    try {
      const response = await axios.put(`/api/v1/projectStatus/update-projectStatus/${id}`, updateData, {
        headers: {
          Authorization: `${validToken}`,
        },
      });

      if (response?.data?.success) {
        setStatus("");
        setDescription("");
        toast.success("Updated successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while updating project status:", error.message);
      toast.error("Error while updating");
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
          <h4>Update Project Status</h4>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="row">
          {
            (fieldPermissions?.status?.show) && (
              <div className="col-md-12">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="status">Status <span className="text-danger">*</span></label>
                  <input type="text" className={`form-control ${fieldPermissions?.status?.read ? "readonly-style" : ""}`} name="status" id="status" value={status} onChange={(e) => fieldPermissions?.status?.read ? null : setStatus(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.description?.show) && (
              <div className="col-md-12">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="description">Description <span className="text-danger"></span></label>
                  <textarea className={`form-control ${fieldPermissions?.description?.read ? "readonly-style" : ""}`} rows={4} name="description" id="description" value={description} onChange={(e) => fieldPermissions?.description?.read ? null : setDescription(e.target.value)} />
                </div>
              </div>
            )
          }
        </div>
        <div className="submit-button text-end">
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={(e) => handleUpdate(e, id)}>Update</Link>
        </div>
      </div>
    </div>
  );
};

export default EditProjectStatus;