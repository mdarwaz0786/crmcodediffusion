/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from "../../../context/authContext.jsx";
import Preloader from "../../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const EditProjectType = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();
  const fieldPermissions = team?.role?.permissions?.projectType?.fields;
  const permissions = team?.role?.permissions?.projectType;

  const fetchSingleData = async (id) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/projectType/single-projectType/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setName(response?.data?.projectType?.name);
        setDescription(response?.data?.projectType?.description);
      };
    } catch (error) {
      console.log("Error while fetching single project type:", error.message);
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
    if (fieldPermissions?.name?.show && !fieldPermissions?.name?.read) {
      updateData.name = name;
    };

    if (fieldPermissions?.description?.show && !fieldPermissions?.description?.read) {
      updateData.description = description;
    };

    try {
      const response = await axios.put(`${base_url}/api/v1/projectType/update-projectType/${id}`, updateData, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setName("");
        setDescription("");
        toast.success("Updated successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while updating project type:", error.message);
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
          <h4>Update Project Type</h4>
          <Link to="/project-type"><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="row">
          {
            (fieldPermissions?.name?.show) && (
              <div className="col-md-12">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="name">Name <span className="text-danger">*</span></label>
                  <input type="text" className={`form-control ${fieldPermissions?.name?.read ? "readonly-style" : ""}`} name="name" id="name" value={name} onChange={(e) => fieldPermissions?.name?.read ? null : setName(e.target.value)} />
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
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={(e) => handleUpdate(e, id)}>Update</Link>
        </div>
      </div>
    </div>
  );
};

export default EditProjectType;