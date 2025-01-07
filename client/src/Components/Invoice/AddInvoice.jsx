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

const AddInvoice = () => {
  const [projects, setProjects] = useState([{ project: "", amount: "" }]);
  const [allProjects, setAllProjects] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tax, setTax] = useState("Exclusive");
  const { validToken, team, isLoading } = useAuth();
  const navigate = useNavigate();
  const permissions = team?.role?.permissions?.invoice;

  const fetchAllProjects = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/project/all-project`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setAllProjects(response?.data?.project);
      };
    } catch (error) {
      console.log("Error while fetching projects:", error.message);
    };
  };

  useEffect(() => {
    if (permissions?.create && !isLoading && team) {
      fetchAllProjects();
    };
  }, [permissions, isLoading, team]);

  const handleAddProject = () => {
    setProjects([...projects, { project: "", amount: "" }]);
  };

  const handleRemoveProject = (index) => {
    const newProjects = projects?.filter((_, i) => i !== index);
    setProjects(newProjects);
    toast.success("Project removed");
  };

  const projectOptions = allProjects?.map((p) => ({
    value: p?._id,
    label: p?.projectName,
  }));

  const handleProjectChange = (index, selectedOption) => {
    const newProjects = [...projects];
    newProjects[index].project = selectedOption.value;
    setProjects(newProjects);
    fetchProjectDetails(selectedOption.value, index);
  };

  const handleAmountChange = (index, field, value) => {
    const newProjects = [...projects];
    newProjects[index][field] = value;
    setProjects(newProjects);
  };

  const fetchProjectDetails = async (projectId, index) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/project/single-project/${projectId}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        const updatedProjects = [...projects];
        updatedProjects[index].amount = response?.data?.project?.projectPrice;
        setProjects(updatedProjects);
      };
    } catch (error) {
      console.log("Error while fetching single project:", error.message);
    };
  };

  const handleFetchAddOnService = async (projectId, index) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/addOnService/single-addOnService-byProjectId/${projectId}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        const addOnCost = parseFloat(response?.data?.data?.totalProjectCost);
        const updatedProjects = [...projects];
        updatedProjects[index].amount = addOnCost;
        setProjects(updatedProjects);
        toast.success("Add on service cost added");
      };
    } catch (error) {
      toast.info(error?.response?.data?.message || "No add on service for this project");
    };
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    // Validation
    for (const project of projects) {
      if (!project?.project) {
        return toast.error("Select project");
      };

      if (!project?.amount) {
        return toast.error("Enter project cost");
      };

      if (parseFloat(project?.amount) < 1) {
        return toast.error("Project cost should not be less than 1");
      };
    };

    if (!date) {
      return toast.error("Enter date");
    };

    if (!tax) {
      return toast.error("Select tax");
    };

    try {
      const invoiceData = {
        projects: projects?.map((project) => ({
          project: project?.project,
          amount: project?.amount,
        })),
        date,
        tax,
      };

      const response = await axios.post(`${base_url}/api/v1/invoice/create-invoice`, invoiceData, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        toast.success("Submitted successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while creating invoices:", error.message);
      toast.error("Error while submitting");
    };
  };

  const selectStyle = {
    control: (provided) => ({ ...provided, outline: 'none', border: "none", boxShadow: 'none' }),
    indicatorSeparator: (provided) => ({ ...provided, display: 'none' }),
    option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? "#f0f0f0" : state.isFocused ? "#e0e0e0" : "#fff", color: "#333" }),
  }

  if (isLoading) {
    return <Preloader />;
  };

  if (!permissions?.create) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "1rem" }}>
          <h4>Add Tax Invoice</h4>
          <Link to="#" onClick={() => navigate(-1)}>
            <button className="btn btn-primary">Back</button>
          </Link>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="tax">Tax <span className="text-danger">*</span></label>
              <select className="form-select" name="tax" id="tax" value={tax} onChange={(e) => setTax(e.target.value)}>
                <option value="">Select</option>
                <option value="Inclusive">Inclusive</option>
                <option value="Exclusive">Exclusive</option>
              </select>
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="date">Date <span className="text-danger">*</span></label>
              <input type="date" className="form-control" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
        </div>

        {
          projects?.map((project, index) => (
            <div key={index} className="row">
              <div className="col-md-6">
                <div className="form-wrap">
                  <div style={{ marginTop: "1.3rem" }}>
                    <label className="col-form-label" htmlFor={`project-${index}`}>Project Name <span className="text-danger">*</span></label>
                  </div>
                  <Select
                    styles={selectStyle}
                    className="form-select p-0"
                    name={`project-${index}`}
                    id={`project-${index}`}
                    options={projectOptions}
                    value={projectOptions?.find((option) => option?.value === project?.project)}
                    onChange={(selectedOption) => handleProjectChange(index, selectedOption)}
                    isSearchable
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-wrap">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <label className="col-form-label" style={{ marginBottom: "-1.5rem" }} htmlFor={`amount-${index}`}>Project Cost <span className="text-danger">*</span></label>
                    <button
                      className="btn btn-info"
                      onClick={() => handleFetchAddOnService(project?.project, index)}
                    >
                      Add On Service
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    name={`amount-${index}`}
                    id={`amount-${index}`}
                    value={project?.amount}
                    onChange={(e) => handleAmountChange(index, "amount", e.target.value)}
                  />
                  {
                    (parseFloat(project?.amount) < 1) && (
                      <div className="col-form-label" style={{ color: "red" }}>Project Cost should not less than 1. <i className="fas fa-times"></i></div>
                    )
                  }
                </div>
              </div>

              <div className="col-md-12 mb-5 mt-0">
                {
                  projects?.length > 1 && (
                    <button className="btn btn-danger" onClick={() => handleRemoveProject(index)}>Remove Project</button>
                  )
                }
              </div>
            </div>
          ))
        }

        <div className="text-center">
          <button className="btn btn-secondary" onClick={handleAddProject}>Add Project</button>
        </div>

        <div className="submit-button text-end">
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link className="btn btn-primary" onClick={handleCreate}>Submit</Link>
        </div>
      </div>
    </div>
  );
};

export default AddInvoice;
