/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from "../../Preloader.jsx";
import Select from "react-select";
const base_url = import.meta.env.VITE_API_BASE_URL;

const AddWorkDetail = () => {
  const [project, setProject] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [totalHour, setTotalHour] = useState("");
  const [totalSpentHour, setTotalSpentHour] = useState("");
  const [totalRemainingHour, setTotalRemainingHour] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [workDetail, setWorkDetail] = useState([{
    startTime: "10:00",
    endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    workDescription: "",
    date: new Date().toISOString().split("T")[0],
  }]);
  const { validToken, team, isLoading } = useAuth();
  const navigate = useNavigate();
  const permissions = team?.role?.permissions?.project;
  const fieldPermissions = team?.role?.permissions?.project?.fields;

  const fetchAllProject = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/project/all-project`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setProject(response?.data?.project);
      };
    } catch (error) {
      console.log("Error while fetching all project:", error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.update && fieldPermissions?.workDetail?.show) {
      fetchAllProject();
    };
  }, [isLoading, team, permissions, fieldPermissions]);

  const fetchSingleProject = async (selectedProjectId) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/project/single-project/${selectedProjectId}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setProjectId(response?.data?.project?.projectId);
        setTotalHour(response?.data?.project?.totalHour);
        setTotalSpentHour(response?.data?.project?.totalSpentHour);
        setTotalRemainingHour(response?.data?.project?.totalRemainingHour);
      };
    } catch (error) {
      console.log("Error while fetching single project:", error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.update && fieldPermissions?.workDetail?.show && selectedProjectId) {
      fetchSingleProject(selectedProjectId);
    };
  }, [isLoading, team, permissions, fieldPermissions, selectedProjectId]);

  const handleWorkDetailChange = (e) => {
    if (fieldPermissions?.workDetail?.read) {
      e.preventDefault();
      return;
    };

    const { name, value } = e.target;
    setWorkDetail((prevDetails) => {
      const updatedDetail = [...prevDetails];
      updatedDetail[0] = { ...updatedDetail[0], [name]: value };
      return updatedDetail;
    });
  };

  // Handle project change
  const handleProjectChange = (selectedOption) => {
    setSelectedProjectId(selectedOption?.value || "");
  };

  // Project options
  const projectOptions = project?.map((p) => ({
    value: p?._id,
    label: p?.projectName,
  }));

  const handleUpdate = async (e, selectedProjectId) => {
    e.preventDefault();

    if (!selectedProjectId) {
      toast.error("Select project name");
      return;
    };

    const validWorkDetails = workDetail?.filter((detail) =>
      detail?.startTime.trim() !== "" &&
      detail?.endTime.trim() !== "" &&
      detail?.workDescription.trim() !== "" &&
      detail?.date.trim() !== ""
    );

    if (validWorkDetails?.length === 0) {
      return toast.error("All required fields must be filled.");
    };

    // Create update object
    const updateData = {};

    if (fieldPermissions?.workDetail?.show && !fieldPermissions?.workDetail?.read) {
      const validWorkDetails = workDetail?.filter((detail) =>
        detail?.startTime && detail?.endTime && detail?.workDescription && detail?.date
      );

      if (validWorkDetails?.length > 0) {
        updateData.workDetail = validWorkDetails;
      };
    };

    try {
      const response = await axios.put(`${base_url}/api/v1/project/update-project/${selectedProjectId}`, updateData, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setSelectedProjectId("");
        setProjectId("");
        setWorkDetail([{
          startTime: "10:00",
          endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          workDescription: "",
          date: new Date().toISOString().split("T")[0]
        }]);
        toast.success("Submitted Successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while adding work log:", error.message);
      toast.error("Error while submitting");
    };
  };

  const convertToHoursAndMinutes = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} hour${h !== 1 ? 's' : ''} ${m} minute${m !== 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (!permissions?.update && !fieldPermissions?.workDetail?.show) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Add Daily Work Summary</h4>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="row">
          {
            (fieldPermissions?.projectName?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="project">Project Name<span className="text-danger">*</span></label>
                  <Select
                    styles={{
                      control: (provided) => ({ ...provided, outline: 'none', border: "none", boxShadow: 'none' }),
                      indicatorSeparator: (provided) => ({ ...provided, display: 'none' }),
                      option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? "#f0f0f0" : state.isFocused ? "#e0e0e0" : "#fff", color: "#333" }),
                    }}
                    className="form-select p-0"
                    name="project"
                    id="project"
                    options={projectOptions}
                    value={projectOptions?.find((option) => option?.value === selectedProjectId)}
                    onChange={handleProjectChange}
                    isSearchable
                  />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.projectId?.show) && (
              <div className="col-md-6">
                <div className="form-wrap" htmlFor="projectId">
                  <label className="col-form-label" htmlFor="projectId">Project ID <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="projectId" id="projectId" value={projectId} disabled />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.totalHour?.show) && (
              <div className="col-md-4">
                <div className="form-wrap" htmlFor="totalHour">
                  <label className="col-form-label" htmlFor="totalHour">Total Hour <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="totalHour" id="totalHour" value={convertToHoursAndMinutes(totalHour)} disabled />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.totalSpentHour?.show) && (
              <div className="col-md-4">
                <div className="form-wrap" htmlFor="totalSpentHour">
                  <label className="col-form-label" htmlFor="projectId">Total Spent Hour <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="totalSpentHour" id="totalSpentHour" value={convertToHoursAndMinutes(totalSpentHour)} disabled />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.totalRemainingHour?.show) && (
              <div className="col-md-4">
                <div className="form-wrap" htmlFor="totalRemainingHour">
                  <label className="col-form-label" htmlFor="totalRemainingHour">Total Remaining Hour <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="totalRemainingHour" id="totalRemainingHour" value={convertToHoursAndMinutes(totalRemainingHour)} disabled />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.workDetail?.show) && (
              <div className="col-md-4">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="startTime">Start Time <span className="text-danger">*</span></label>
                  <input type="time" className="form-control" name="startTime" id="startTime" value={workDetail[0]?.startTime} onChange={handleWorkDetailChange} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.workDetail?.show) && (
              <div className="col-md-4">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="endTime">End Time <span className="text-danger">*</span></label>
                  <input type="time" className="form-control" name="endTime" id="endTime" value={workDetail[0]?.endTime} onChange={handleWorkDetailChange} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.workDetail?.show) && (
              <div className="col-md-4">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="date">Date <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" name="date" id="date" value={workDetail[0]?.date} onChange={handleWorkDetailChange} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.workDetail?.show) && (
              <div className="col-md-12">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="workDescription">
                    Work Description <span className="text-danger">*</span>
                  </label>
                  <textarea type="text" rows={6} className="form-control" name="workDescription" id="workDescription" value={workDetail[0]?.workDescription} onChange={handleWorkDetailChange} />
                </div>
              </div>
            )
          }
        </div>
        <div className="submit-button text-end">
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={(e) => handleUpdate(e, selectedProjectId)}>Submit</Link>
        </div>
      </div>
    </div>
  );
};

export default AddWorkDetail;
