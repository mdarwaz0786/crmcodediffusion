/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from "../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const EditProject = () => {
  const [customer, setCustomer] = useState([]);
  const [projectType, setProjectType] = useState([]);
  const [projectStatus, setProjectStatus] = useState([]);
  const [projectCategory, setProjectCategory] = useState([]);
  const [teamMember, setTeamMember] = useState([]);
  const [technology, setTechnology] = useState([]);
  const [projectTiming, setProjectTiming] = useState([]);
  const [projectPriority, setProjectPriority] = useState([]);

  const [projectName, setProjectName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProjectType, setSelectedProjectType] = useState("");
  const [selectedProjectCategory, setSelectedProjectCategory] = useState("");
  const [selectedProjectTiming, setSelectedProjectTiming] = useState("");
  const [selectedProjectPriority, setSelectedProjectPriority] = useState("");
  const [selectedProjectStatus, setSelectedProjectStatus] = useState("");
  const [selectedResponsible, setSelectedResponsible] = useState([]);
  const [selectedLeader, setSelectedLeader] = useState([]);
  const [selectedTechnology, setSelectedTechnology] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [projectPrice, setProjectPrice] = useState("");
  const [totalPaid, setTotalPaid] = useState("");
  const [totalDues, setTotalDues] = useState("");
  const [totalHour, setTotalHour] = useState("");
  const [totalSpentHour, setTotalSpentHour] = useState("");
  const [totalRemainingHour, setTotalRemainingHour] = useState("");
  const [description, setDescription] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const { team, validToken, isLoading } = useAuth();
  const fieldPermissions = team?.role?.permissions?.project?.fields;
  const permissions = team?.role?.permissions?.project;

  const fetchAllCustomer = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/customer/all-customer`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setCustomer(response?.data?.customer);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  const fetchAllProjectCatgory = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/projectCategory/all-projectCategory`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setProjectCategory(response?.data?.projectCategory);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  const fetchAllProjectTiming = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/projectTiming/all-projectTiming`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setProjectTiming(response?.data?.projectTiming);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  const fetchAllTeamMember = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/team/all-team`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setTeamMember(response?.data?.team);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  const fetchAllTechnology = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/technology/all-technology`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setTechnology(response?.data?.technology);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

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

  const fetchAllProjectType = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/projectType/all-projectType`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setProjectType(response?.data?.projectType);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  const fetchAllProjectPriority = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/projectPriority/all-projectPriority`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setProjectPriority(response?.data?.projectPriority);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.update) {
      fetchAllCustomer();
      fetchAllProjectCatgory();
      fetchAllProjectType();
      fetchAllProjectStatus();
      fetchAllTeamMember();
      fetchAllProjectTiming();
      fetchAllProjectPriority();
      fetchAllTechnology();
    };
  }, [isLoading, team, permissions]);

  const fetchSingleProject = async (id) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/project/single-project/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setProjectName(response?.data?.project?.projectName);
        setProjectId(response?.data?.project?.projectId);
        setSelectedCustomer(response?.data?.project?.customer?._id);
        setSelectedProjectType(response?.data?.project?.projectType?._id);
        setSelectedProjectCategory(response?.data?.project?.projectCategory?._id);
        setSelectedProjectTiming(response?.data?.project?.projectTiming?._id);
        setSelectedProjectPriority(response?.data?.project?.projectPriority?._id);
        setSelectedProjectStatus(response?.data?.project?.projectStatus?._id);
        setSelectedResponsible(response?.data?.project?.responsiblePerson?.map((r) => r?._id));
        setSelectedLeader(response?.data?.project?.teamLeader?.map((l) => l?._id));
        setSelectedTechnology(response?.data?.project?.technology?.map((t) => t?._id));
        setProjectPrice(response?.data?.project?.projectPrice);
        setTotalPaid(response?.data?.project?.totalPaid);
        setTotalDues(response?.data?.project?.totalDues);
        setStartDate(response?.data?.project?.startDate);
        setEndDate(response?.data?.project?.endDate);
        setTotalHour(response?.data?.project?.totalHour);
        setTotalSpentHour(response?.data?.project?.totalSpentHour);
        setTotalRemainingHour(response?.data?.project?.totalRemainingHour);
        setDescription(response?.data?.project?.description);
      };
    } catch (error) {
      console.log("Error while fetching single project:", error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.update && id) {
      fetchSingleProject(id);
    };
  }, [isLoading, team, permissions, id]);

  const handleUpdate = async (e, id) => {
    e.preventDefault();

    // Create update object
    const updateData = {};

    // Conditionally include fields based on fieldPermissions
    if (fieldPermissions?.projectName?.show && !fieldPermissions?.projectName?.read) {
      updateData.projectName = projectName;
    };

    if (fieldPermissions?.customer?.show && !fieldPermissions?.customer?.read) {
      updateData.customer = selectedCustomer;
    };

    if (fieldPermissions?.projectType?.show && !fieldPermissions?.projectType?.read) {
      updateData.projectType = selectedProjectType;
    };

    if (fieldPermissions?.projectCategory?.show && !fieldPermissions?.projectCategory?.read) {
      updateData.projectCategory = selectedProjectCategory;
    };

    if (fieldPermissions?.projectTiming?.show && !fieldPermissions?.projectTiming?.read) {
      updateData.projectTiming = selectedProjectTiming;
    };

    if (fieldPermissions?.projectStatus?.show && !fieldPermissions?.projectStatus?.read) {
      updateData.projectStatus = selectedProjectStatus;
    };

    if (fieldPermissions?.projectPriority?.show && !fieldPermissions?.projectPriority?.read) {
      updateData.projectPriority = selectedProjectPriority;
    };

    if (fieldPermissions?.responsiblePerson?.show && !fieldPermissions?.responsiblePerson?.read) {
      updateData.responsiblePerson = selectedResponsible;
    };

    if (fieldPermissions?.teamLeader?.show && !fieldPermissions?.teamLeader?.read) {
      updateData.teamLeader = selectedLeader;
    };

    if (fieldPermissions?.technology?.show && !fieldPermissions?.technology?.read) {
      updateData.technology = selectedTechnology;
    };

    if (fieldPermissions?.startDate?.show && !fieldPermissions?.startDate?.read) {
      updateData.startDate = startDate;
    };

    if (fieldPermissions?.endDate?.show && !fieldPermissions?.endDate?.read) {
      updateData.endDate = endDate;
    };

    if (fieldPermissions?.projectPrice?.show && !fieldPermissions?.projectPrice?.read) {
      updateData.projectPrice = projectPrice;
    };

    if (fieldPermissions?.totalHour?.show && !fieldPermissions?.totalHour?.read) {
      updateData.totalHour = totalHour;
    };

    if (fieldPermissions?.description?.show && !fieldPermissions?.description?.read) {
      updateData.description = description;
    };

    try {
      const response = await axios.put(`${base_url}/api/v1/project/update-project/${id}`, updateData, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setProjectName("");
        setProjectId("");
        setSelectedCustomer("");
        setSelectedProjectType("");
        setSelectedProjectCategory("");
        setSelectedProjectTiming("");
        setSelectedProjectStatus("");
        setSelectedProjectPriority("");
        setSelectedResponsible([]);
        setSelectedLeader([]);
        setSelectedTechnology([]);
        setProjectPrice("");
        setTotalDues("");
        setTotalPaid("");
        setStartDate("");
        setEndDate("");
        setTotalHour("");
        setTotalSpentHour("");
        setTotalRemainingHour("");
        setDescription("");
        toast.success("Submitted successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while updating project:", error.message);
      toast.error("Error while submitting");
    };
  };

  const handleSelectChangeResponsible = (e) => {
    const value = e.target.value;
    if (value && !selectedResponsible?.includes(value)) {
      setSelectedResponsible([...selectedResponsible, value]);
    };
  };

  const handleRemoveResponsible = (value) => {
    setSelectedResponsible(selectedResponsible?.filter((item) => item !== value));
  };

  const handleSelectChangeLeader = (e) => {
    const value = e.target.value;
    if (value && !selectedLeader?.includes(value)) {
      setSelectedLeader([...selectedLeader, value]);
    };
  };

  const handleRemoveLeader = (value) => {
    setSelectedLeader(selectedLeader?.filter((item) => item !== value));
  };

  const handleSelectChangeTechnology = (e) => {
    const value = e.target.value;
    if (value && !selectedTechnology?.includes(value)) {
      setSelectedTechnology([...selectedTechnology, value]);
    };
  };

  const handleRemoveTechnology = (value) => {
    setSelectedTechnology(selectedTechnology?.filter((item) => item !== value));
  };

  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'list', 'bullet', 'indent',
    'link', 'image', 'video', 'color', 'background',
    'align', 'script',
  ];

  const convertToHoursAndMinutes = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} hour${h !== 1 ? 's' : ''} ${m} minute${m !== 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (!permissions?.update) {
    return <Navigate to="/" />;
  };

  return (
    <>
      <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
        <div className="content">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h4>Update Project</h4>
            <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
          </div>
          <div className="row">
            {
              (fieldPermissions?.projectName?.show) && (
                <div className="col-md-6">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="projectName">Project Name <span className="text-danger">*</span></label>
                    <input type="text" className={`form-control ${fieldPermissions?.projectName?.read ? "readonly-style" : ""}`} name="projectName" id="projectName" value={projectName} onChange={(e) => fieldPermissions?.projectName?.read ? null : setProjectName(e.target.value)} />
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.projectId?.show) && (
                <div className="col-md-6">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="projectId">Project ID<span className="text-danger"></span></label>
                    <input type="text" className={`form-control ${fieldPermissions?.projectId?.read ? "readonly-style" : ""}`} name="projectId" id="projectId" value={projectId} disabled />
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.customer?.show) && (
                <div className="col-md-6">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="customer">Client <span className="text-danger">*</span></label>
                    <select className={`form-select ${fieldPermissions?.customer?.read ? "readonly-style" : ""}`} name="customer" id="customer" value={selectedCustomer} onChange={(e) => fieldPermissions?.customer?.read ? null : setSelectedCustomer(e.target.value)} >
                      <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                      {
                        customer?.map((c) => (
                          <option key={c?._id} value={c?._id}>{c?.name}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.projectType?.show) && (
                <div className="col-md-6">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="projectType">Project Type <span className="text-danger">*</span></label>
                    <select className={`form-select ${fieldPermissions?.projectType?.read ? "readonly-style" : ""}`} name="projectType" id="projectType" value={selectedProjectType} onChange={(e) => fieldPermissions?.projectType?.read ? null : setSelectedProjectType(e.target.value)}>
                      <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                      {
                        projectType?.map((p) => (
                          <option key={p?._id} value={p?._id} >{p?.name}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.projectCategory?.show) && (
                <div className="col-md-6">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="projectCategory">Project Category <span className="text-danger">*</span></label>
                    <select className={`form-select ${fieldPermissions?.projectCategory?.read ? "readonly-style" : ""}`} name="projectCategory" id="projectCategory" value={selectedProjectCategory} onChange={(e) => fieldPermissions?.projectCategory?.read ? null : setSelectedProjectCategory(e.target.value)} >
                      <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                      {
                        projectCategory?.map((p) => (
                          <option key={p?._id} value={p?._id}>{p?.name}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.projectTiming?.show) && (
                <div className="col-md-6">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="projectTiming">Project Timeline <span className="text-danger">*</span></label>
                    <select className={`form-select ${fieldPermissions?.projectTiming?.read ? "readonly-style" : ""}`} name="projectTiming" id="projectTiming" value={selectedProjectTiming} onChange={(e) => fieldPermissions?.projectTiming?.read ? null : setSelectedProjectTiming(e.target.value)} >
                      <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                      {
                        projectTiming?.map((p) => (
                          <option key={p?._id} value={p?._id}>{p?.name}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.projectPriority?.show) && (
                <div className="col-md-6">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="projectPriority">Project Priority <span className="text-danger">*</span></label>
                    <select className={`form-select ${fieldPermissions?.projectPriority?.read ? "readonly-style" : ""}`} name="projectPriority" id="projectPriority" value={selectedProjectPriority} onChange={(e) => fieldPermissions?.projectPriority?.read ? null : setSelectedProjectPriority(e.target.value)}>
                      <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                      {
                        projectPriority?.map((p) => (
                          <option key={p?._id} value={p?._id}>{p?.name}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.projectStatus?.show) && (
                <div className="col-md-6">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="projectStatus">Project Status <span className="text-danger">*</span></label>
                    <select className={`form-select ${fieldPermissions?.projectStatus?.read ? "readonly-style" : ""}`} name="projectStatus" id="projectStatus" value={selectedProjectStatus} onChange={(e) => fieldPermissions?.projectStatus?.read ? null : setSelectedProjectStatus(e.target.value)} >
                      <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                      {
                        projectStatus?.map((p) => (
                          <option key={p?._id} value={p?._id}>{p?.status}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.startDate?.show) && (
                <div className="col-md-6">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="startDate">Start Date <span className="text-danger">*</span></label>
                    <input type="date" className={`form-control ${fieldPermissions?.startDate?.read ? "readonly-style" : ""}`} name="startDate" id="startDate" value={startDate} onChange={(e) => fieldPermissions?.startDate?.read ? null : setStartDate(e.target.value)} />
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.endDate?.show) && (
                <div className="col-md-6">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="endDate">End Date <span className="text-danger">*</span></label>
                    <input type="date" className={`form-control ${fieldPermissions?.endDate?.read ? "readonly-style" : ""}`} name="endDate" id="endDate" value={endDate} onChange={(e) => fieldPermissions?.endDate?.read ? null : setEndDate(e.target.value)} />
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.projectPrice?.show) && (
                <div className="col-md-4">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="projectPrice">Project Cost <span className="text-danger">*</span></label>
                    <input className={`form-control ${fieldPermissions?.projectPrice?.read ? "readonly-style" : ""}`} type="text" name="projectPrice" id="projectPrice" value={projectPrice} onChange={(e) => fieldPermissions?.projectPrice?.read ? null : setProjectPrice(e.target.value)} />
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.totalPaid?.show) && (
                <div className="col-md-4">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="totalPaid">Total Received <span className="text-danger"></span></label>
                    <input className={`form-control ${fieldPermissions?.totalPaid?.read ? "readonly-style" : ""}`} type="text" name="totalPaid" id="totalPaid" value={`₹${totalPaid}`} disabled />
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.totalDues?.show) && (
                <div className="col-md-4">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="totalDues">Total Dues <span className="text-danger"></span></label>
                    <input className={`form-control ${fieldPermissions?.totalDues?.read ? "readonly-style" : ""}`} type="text" name="totalDues" id="totalDues" value={`₹${totalDues}`} disabled />
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.totalHour?.show) && (
                <div className="col-md-4">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="totalHour">Total Hour <span className="text-danger">*</span></label>
                    <input type="text" className={`form-control ${fieldPermissions?.totalHour?.read ? "readonly-style" : ""}`} name="totalHour" id="totalHour" value={totalHour} onChange={(e) => fieldPermissions?.totalHour?.read ? null : setTotalHour(e.target.value)} />
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.totalSpentHour?.show) && (
                <div className="col-md-4">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="totalSpentHour">Total Spent Hour <span className="text-danger"></span></label>
                    <input type="text" className={`form-control ${fieldPermissions?.totalSpentHour?.read ? "readonly-style" : ""}`} name="totalSpentHour" id="totalSpentHour" value={convertToHoursAndMinutes(totalSpentHour)} disabled />
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.totalRemainingHour?.show) && (
                <div className="col-md-4">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="totalRemainingHour">Total Remaining Hour <span className="text-danger"></span></label>
                    <input type="text" className={`form-control ${fieldPermissions?.totalRemainingHour?.read ? "readonly-style" : ""}`} name="totalRemainingHour" id="totalRemainingHour" value={convertToHoursAndMinutes(totalRemainingHour)} disabled />
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.responsiblePerson?.show) && (
                <div className="col-md-4">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="responsiblePerson">Responsible Person <span className="text-danger">*</span></label>
                    <select className={`form-select ${fieldPermissions?.responsiblePerson?.read ? "readonly-style" : ""}`} name="responsiblePerson" id="responsiblePerson" value="" onChange={(e) => fieldPermissions?.responsiblePerson?.read ? null : handleSelectChangeResponsible(e)}>
                      <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                      {
                        teamMember?.filter((t) => !selectedResponsible.includes(t?._id)).map((t) => (
                          <option key={t?._id} value={t?._id}>{t?.name}</option>
                        ))
                      }
                    </select>
                    <div className="selected-container">
                      {
                        selectedResponsible?.map((responsible, index) => (
                          <span key={index} className="selected-item">
                            {teamMember?.find((t) => t?._id === responsible)?.name}
                            {(fieldPermissions?.responsiblePerson?.read) ? (null) : (<button type="button" className="remove-btn" onClick={() => fieldPermissions?.responsiblePerson?.read ? null : handleRemoveResponsible(responsible)}>{"x"}</button>)}
                          </span>
                        ))
                      }
                    </div>
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.teamLeader?.show) && (
                <div className="col-md-4">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="teamLeader">Team Leader  <span className="text-danger">*</span></label>
                    <select className={`form-select ${fieldPermissions?.teamLeader?.read ? "readonly-style" : ""}`} name="teamLeader" id="teamLeader" value="" onChange={(e) => fieldPermissions?.teamLeader?.read ? null : handleSelectChangeLeader(e)}>
                      <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                      {
                        teamMember?.filter((t) => !selectedLeader.includes(t?._id)).map((t) => (
                          <option key={t?._id} value={t?._id}>{t?.name}</option>
                        ))
                      }
                    </select>
                    <div className="selected-container">
                      {
                        selectedLeader?.map((leader, index) => (
                          <span key={index} className="selected-item">
                            {teamMember?.find((t) => t?._id === leader)?.name}
                            {(fieldPermissions?.teamLeader?.read) ? (null) : (<button type="button" className="remove-btn" onClick={() => fieldPermissions?.teamLeader?.read ? null : handleRemoveLeader(leader)}>{"x"}</button>)}
                          </span>
                        ))
                      }
                    </div>
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.technology?.show) && (
                <div className="col-md-4">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="technology">Technology Used <span className="text-danger">*</span></label>
                    <select className={`form-select ${fieldPermissions?.technology?.read ? "readonly-style" : ""}`} name="technology" id="technology" value="" onChange={(e) => fieldPermissions?.technology?.read ? null : handleSelectChangeTechnology(e)}>
                      <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                      {
                        technology?.filter((t) => !selectedTechnology?.includes(t?._id))?.map((t) => (
                          <option key={t?._id} value={t?._id}>{t?.name}</option>
                        ))
                      }
                    </select>
                    <div className="selected-container">
                      {
                        selectedTechnology?.map((tech, index) => (
                          <span key={index} className="selected-item">
                            {technology?.find((t) => t?._id === tech)?.name}
                            {(fieldPermissions?.technology?.read) ? (null) : (<button type="button" className="remove-btn" onClick={() => fieldPermissions?.technology?.read ? null : handleRemoveTechnology(tech)}>{"x"}</button>)}
                          </span>
                        ))
                      }
                    </div>
                  </div>
                </div>
              )
            }
            {
              (fieldPermissions?.description?.show) && (
                <div className="col-md-12">
                  <div className="form-wrap">
                    <label className="col-form-label" htmlFor="description">Development Phase Description <span className="text-danger">*</span></label>
                    <ReactQuill className={`custom-quill-editor ql-container ${fieldPermissions?.description?.read ? "readonly-style" : ""}`} id="description" name="description" value={description} onChange={(value) => fieldPermissions?.description?.read ? null : setDescription(value)} theme="snow" modules={modules} formats={formats} readOnly={fieldPermissions?.description?.read} />
                  </div>
                </div>
              )
            }
          </div>
          <div className="submit-button text-end">
            <Link to="#" onClick={() => navigate(-1)} className="btn btn-light">Cancel</Link>
            <Link to="#" className="btn btn-primary" onClick={(e) => handleUpdate(e, id)}>Submit</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProject;