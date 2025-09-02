/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from "../../context/authContext.jsx";
import { Navigate } from 'react-router-dom';
const base_url = import.meta.env.VITE_API_BASE_URL;

const AddProjectWork = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();
  const [description, setDescription] = useState("");
  const [projectStatus, setProjectStatus] = useState([]);
  const [selectedProjectStatus, setSelectedProjectStatus] = useState("");

  const fetchAllProjectStatus = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/projectStatus/all-projectStatus`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setProjectStatus(response?.data?.projectStatus);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (id && validToken && team && !isLoading) {
      fetchAllProjectStatus();
    };
  }, [id, validToken, team, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProjectStatus || !description) {
      return toast.error("All fields are required");
    };

    const date = new Date().toISOString().split("T")[0];
    const employee = team?._id;

    try {
      const response = await axios.post(
        `${base_url}/api/v1/projectWork/create-projectWork`,
        {
          employee,
          project: id,
          status: selectedProjectStatus,
          date,
          description,
        },
        {
          headers: {
            Authorization: validToken,
          },
        }
      );

      if (response?.data?.success) {
        setDescription("");
        setSelectedProjectStatus("");
        toast.success("Submitted successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log('Error:', error?.response?.data?.message);
      toast.error(error?.response?.data?.message);
    };
  };

  if (!team?.role?.permissions?.workSummary?.create) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Update Project Status</h4>
          <Link to="#" onClick={() => navigate(-1)}>
            <button className="btn btn-primary">Back</button>
          </Link>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="projectStatus">Project Status <span className="text-danger">*</span></label>
              <select className="form-select" name="projectStatus" id="projectStatus" value={selectedProjectStatus} onChange={(e) => setSelectedProjectStatus(e.target.value)}>
                <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                {
                  projectStatus?.map((p) => (
                    <option key={p?._id} value={p?._id}>{p?.status}</option>
                  ))
                }
              </select>
            </div>
          </div>

          <div className="col-md-12">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="description">Description <span className="text-danger">*</span></label>
              <textarea
                rows={6}
                type="text"
                name="description"
                id="description"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="text-start">
            <Link to="#" style={{ marginRight: "1rem" }} onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
            <Link to="#" className="btn btn-primary" onClick={handleSubmit}>Submit</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProjectWork;
