/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from "../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const AddProject = () => {
  const { team, validToken, isLoading } = useAuth();
  const permissions = team?.role?.permissions?.project;
  const [customer, setCustomer] = useState([]);
  const [projectType, setProjectType] = useState([]);
  const [projectStatus, setProjectStatus] = useState([]);
  const [projectCategory, setProjectCategory] = useState([]);
  const [teamMember, setTeamMember] = useState([]);
  const [technology, setTechnology] = useState([]);
  const [projectTiming, setProjectTiming] = useState([]);
  const [projectPriority, setProjectPriority] = useState([]);

  const [projectName, setProjectName] = useState("");
  const [selectedProjectType, setSelectedProjectType] = useState("");
  const [selectedProjectCategory, setSelectedProjectCategory] = useState("");
  const [selectedProjectStatus, setSelectedProjectStatus] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProjectTiming, setSelectedProjectTiming] = useState("");
  const [selectedProjectPriority, setSelectedProjectPriority] = useState("");
  const [selectedResponsible, setSelectedResponsible] = useState([]);
  const [selectedLeader, setSelectedLeader] = useState([]);
  const [selectedTechnology, setSelectedTechnology] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [projectPrice, setProjectPrice] = useState("");
  const [totalHour, setTotalHour] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

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
    if (!isLoading && team && permissions?.create) {
      fetchAllCustomer();
      fetchAllProjectCatgory();
      fetchAllProjectType();
      fetchAllProjectStatus();
      fetchAllProjectTiming();
      fetchAllProjectPriority();
      fetchAllTeamMember();
      fetchAllTechnology();
    };
  }, [isLoading, team, permissions]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {

      // Validation
      if (!projectName) {
        return toast.error("Enter project name");
      };

      if (!selectedCustomer) {
        return toast.error("Select Client");
      };

      if (!selectedProjectType) {
        return toast.error("Select project type");
      };

      if (!selectedProjectCategory) {
        return toast.error("Select project category");
      };

      if (!selectedProjectTiming) {
        return toast.error("Select project timeline");
      };

      if (!selectedProjectPriority) {
        return toast.error("Select project priority");
      };

      if (!selectedProjectStatus) {
        return toast.error("Select project status");
      };

      if (selectedResponsible?.length === 0) {
        return toast.error("Select responsible person");
      };

      if (selectedLeader?.length === 0) {
        return toast.error("Select team leader");
      };

      if (selectedTechnology?.length === 0) {
        return toast.error("Select technology");
      };

      if (!projectPrice) {
        return toast.error("Enter project cost");
      };

      if (!startDate) {
        return toast.error("Enter start date");
      };

      if (!endDate) {
        return toast.error("Enter end date");
      };

      if (!totalHour) {
        return toast.error("Enter total hour");
      };

      if (!description) {
        return toast.error("Enter project phase description");
      };

      const response = await axios.post(`${base_url}/api/v1/project/create-project`,
        {
          projectName,
          customer: selectedCustomer,
          projectType: selectedProjectType,
          projectCategory: selectedProjectCategory,
          projectTiming: selectedProjectTiming,
          projectPriority: selectedProjectPriority,
          projectStatus: selectedProjectStatus,
          responsiblePerson: selectedResponsible,
          teamLeader: selectedLeader,
          technology: selectedTechnology,
          projectPrice,
          startDate,
          endDate,
          totalHour,
          description,
        },
        {
          headers: {
            Authorization: validToken,
          },
        },
      );

      if (response?.data?.success) {
        setProjectName("");
        setSelectedCustomer("");
        setSelectedProjectType("");
        setSelectedProjectCategory("");
        setSelectedProjectStatus("");
        setSelectedProjectTiming("");
        setSelectedProjectPriority("");
        setSelectedResponsible([]);
        setSelectedLeader([]);
        setProjectPrice("");
        setStartDate("");
        setEndDate("");
        setTotalHour("");
        setDescription("");
        toast.success("Submitted Successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while creating project:", error.message);
      toast.error("Error while creating");
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

  if (isLoading) {
    return <Preloader />;
  };

  if (!permissions?.create) {
    return <Navigate to="/" />;
  };

  return (
    <>
      <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
        <div className="content">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h4>Add Project</h4>
            <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="form-wrap">
                <label className="col-form-label" htmlFor="projectName">Project Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="projectName" id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-wrap">
                <label className="col-form-label" htmlFor="technology">Technology Used <span className="text-danger">*</span></label>
                <select className="form-select" name="technology" id="technology" value="" onChange={handleSelectChangeTechnology}>
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
                        <button type="button" className="remove-btn" onClick={() => handleRemoveTechnology(tech)}>{"x"}</button>
                      </span>
                    ))
                  }
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-wrap">
                <label className="col-form-label" htmlFor="customer">Client <span className="text-danger">*</span></label>
                <select className="form-select" name="customer" id="customer" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                  <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                  {
                    customer?.map((c) => (
                      <option key={c?._id} value={c?._id}>{c?.name}</option>
                    ))
                  }
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-wrap">
                <label className="col-form-label" htmlFor="projectType">Project Type <span className="text-danger">*</span></label>
                <select className="form-select" name="projectType" id="projectType" value={selectedProjectType} onChange={(e) => setSelectedProjectType(e.target.value)}>
                  <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                  {
                    projectType?.map((p) => (
                      <option key={p?._id} value={p?._id}>{p?.name}</option>
                    ))
                  }
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-wrap">
                <label className="col-form-label" htmlFor="projectCategory">Project Category <span className="text-danger">*</span></label>
                <select className="form-select" name="projectCategory" id="projectCategory" value={selectedProjectCategory} onChange={(e) => setSelectedProjectCategory(e.target.value)}>
                  <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                  {
                    projectCategory?.map((p) => (
                      <option key={p?._id} value={p?._id}>{p?.name}</option>
                    ))
                  }
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-wrap">
                <label className="col-form-label" htmlFor="projectTiming">Project Timeline  <span className="text-danger">*</span></label>
                <select className="form-select" name="projectTiming" id="projectTiming" value={selectedProjectTiming} onChange={(e) => setSelectedProjectTiming(e.target.value)}>
                  <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                  {
                    projectTiming?.map((p) => (
                      <option key={p?._id} value={p?._id}>{p?.name}</option>
                    ))
                  }
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-wrap">
                <label className="col-form-label" htmlFor="projectPriority">Project Priority <span className="text-danger">*</span></label>
                <select className="form-select" name="projectPriority" id="projectPriority" value={selectedProjectPriority} onChange={(e) => setSelectedProjectPriority(e.target.value)}>
                  <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                  {
                    projectPriority?.map((p) => (
                      <option key={p?._id} value={p?._id}>{p?.name}</option>
                    ))
                  }
                </select>
              </div>
            </div>
            <div className="col-md-6">
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
            <div className="col-md-6">
              <div className="form-wrap">
                <label className="col-form-label" htmlFor="projectPrice">Project Cost <span className="text-danger">*</span></label>
                <input className="form-control" type="text" name="projectPrice" id="projectPrice" value={projectPrice} onChange={(e) => setProjectPrice(e.target.value)} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-wrap">
                <label className="col-form-label" htmlFor="totalHour">Total Hour <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="totalHour" id="totalHour" value={totalHour} onChange={(e) => setTotalHour(e.target.value)} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-wrap">
                <label className="col-form-label" htmlFor="startDate">Start Date <span className="text-danger">*</span></label>
                <input type="date" className="form-control" name="startDate" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-wrap">
                <label className="col-form-label" htmlFor="endDate">End Date <span className="text-danger">*</span></label>
                <input type="date" className="form-control" name="endDate" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-wrap">
                <label className="col-form-label" htmlFor="responsiblePerson">Responsible Person <span className="text-danger">*</span></label>
                <select className="form-select" name="responsiblePerson" id="responsiblePerson" value="" onChange={handleSelectChangeResponsible}>
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
                        <button type="button" className="remove-btn" onClick={() => handleRemoveResponsible(responsible)}>{"x"}</button>
                      </span>
                    ))
                  }
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-wrap">
                <label className="col-form-label" htmlFor="teamLeader">Team Leader  <span className="text-danger">*</span></label>
                <select className="form-select" name="TeamLeader" id="teamLeader" value="" onChange={handleSelectChangeLeader}>
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
                        <button type="button" className="remove-btn" onClick={() => handleRemoveLeader(leader)}>{"x"}</button>
                      </span>
                    ))
                  }
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-wrap">
                <label className="col-form-label" htmlFor="description">Development Phase Description <span className="text-danger">*</span></label>
                <ReactQuill className="custom-quill-editor ql-container" id="description" name="description" value={description} onChange={(value) => setDescription(value)} theme="snow" modules={modules} formats={formats} />
              </div>
            </div>
          </div>
          <div className="submit-button text-end">
            <Link to="#" onClick={() => navigate(-1)} className="btn btn-light">Cancel</Link>
            <Link to="#" className="btn btn-primary" onClick={(e) => handleCreate(e)}>Submit</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProject;