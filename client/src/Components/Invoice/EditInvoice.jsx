/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from "../../Preloader.jsx";
import Select from "react-select";
const base_url = import.meta.env.VITE_API_BASE_URL;

const EditInvoice = () => {
  const { id } = useParams();
  const [projects, setProjects] = useState([{ project: "", amount: "" }]);
  const [allProjects, setAllProjects] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tax, setTax] = useState("Exclusive");
  const { validToken, team, isLoading } = useAuth();
  const navigate = useNavigate();
  const permissions = team?.role?.permissions?.invoice;
  const fieldPermissions = team?.role?.permissions?.invoice?.fields;

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
      console.log("Error while fetching all projects:", error.message);
    };
  };

  const fetchSingleInvoice = async (id) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/invoice/single-invoice/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        const invoiceData = response?.data?.invoice?.projects;

        setProjects(invoiceData?.map((d) => ({
          project: d?.project?._id,
          amount: d?.amount,
          projectName: d?.project?.projectName,
        })));

        setDate(response?.data?.invoice?.date);
        setTax(response?.data?.invoice?.tax);
      };
    } catch (error) {
      console.log("Error while fetching single invoice:", error.message);
    };
  };

  useEffect(() => {
    if (permissions?.update && !isLoading && team && id) {
      fetchAllProjects();
      fetchSingleInvoice(id);
    };
  }, [permissions, team, isLoading, id]);

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
    newProjects[index].project = selectedOption?.value;
    setProjects(newProjects);
    fetchProjectDetails(selectedOption?.value, index);
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

  const handleUpdate = async (e, id) => {
    e.preventDefault();

    if (fieldPermissions?.projects?.read) {
      e.preventDefault();
      return toast.error("Permission denied for projects change");
    };

    if (fieldPermissions?.tax?.read) {
      e.preventDefault();
      return toast.error("Permission denied for tax change");
    };

    if (fieldPermissions?.date?.read) {
      e.preventDefault();
      return toast.error("Permission denied for date change");
    };

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
      const formData = {
        projects: projects?.map((p) => ({
          project: p?.project,
          amount: p?.amount,
        })),
        date,
        tax,
      };

      const response = await axios.put(`${base_url}/api/v1/invoice/update-invoice/${id}`, formData, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        toast.success("Submitted successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while updating invoice:", error.message);
      toast.error("Error while submitting");
    };
  };

  const selectStyle = {
    control: (provided) => ({ ...provided, outline: 'none', border: "none", boxShadow: 'none' }),
    indicatorSeparator: (provided) => ({ ...provided, display: 'none' }),
    option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? "#f0f0f0" : state.isFocused ? "#e0e0e0" : "#fff", color: "#333" }),
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (!permissions?.update) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "1rem" }}>
          <h4>Edit Tax Invoice</h4>
          <Link to="#" onClick={() => navigate(-1)}>
            <button className="btn btn-primary">Back</button>
          </Link>
        </div>

        <div className="row">
          {
            (fieldPermissions?.tax?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="tax">Tax <span className="text-danger">*</span></label>
                  <select className={`form-select ${fieldPermissions?.tax?.read ? "readonly-style" : ""}`} name="tax" id="tax" value={tax} onChange={(e) => fieldPermissions?.tax?.read ? null : setTax(e.target.value)}>
                    <option value="">Select</option>
                    <option value="Inclusive">Inclusive</option>
                    <option value="Exclusive">Exclusive</option>
                  </select>
                </div>
              </div>
            )
          }

          {
            (fieldPermissions?.date?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="date">Date <span className="text-danger">*</span></label>
                  <input type="date" className={`form-control ${fieldPermissions?.date?.read ? "readonly-style" : ""}`} id="date" value={date} onChange={(e) => fieldPermissions?.date?.read ? null : setDate(e.target.value)} />
                </div>
              </div>
            )
          }
        </div>

        {
          projects?.map((project, index) => (
            <div key={index} className="row">
              {
                (fieldPermissions?.projects?.show) && (
                  <div className="col-md-6">
                    <div className="form-wrap">
                      <div style={{ marginTop: "1.3rem" }}>
                        <label className="col-form-label" htmlFor={`project-${index}`}>Project Name <span className="text-danger">*</span></label>
                      </div>
                      <Select
                        styles={selectStyle}
                        className={`form-select p-0 ${fieldPermissions?.projects?.read ? "readonly-style" : ""}`}
                        name={`project-${index}`}
                        id={`project-${index}`}
                        options={projectOptions}
                        value={projectOptions?.find((option) => option?.value === project?.project)}
                        onChange={(selectedOption) => fieldPermissions?.projects?.read ? null : handleProjectChange(index, selectedOption)}
                        isSearchable
                      />
                    </div>
                  </div>
                )
              }

              {
                (fieldPermissions?.projects?.show) && (
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
                        className={`form-control ${fieldPermissions?.projects?.read ? "readonly-style" : ""}`}
                        name={`amount-${index}`}
                        id={`amount-${index}`}
                        value={project?.amount}
                        onChange={(e) => fieldPermissions?.projects?.read ? null : handleAmountChange(index, 'amount', e.target.value)}
                      />
                      {
                        (parseFloat(project?.amount) < 1) && (
                          <div className="col-form-label" style={{ color: "red" }}>Project Cost should not less than 1. <i className="fas fa-times"></i></div>
                        )
                      }
                    </div>
                  </div>
                )
              }

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
          <Link className="btn btn-primary" onClick={(e) => handleUpdate(e, id)}>Submit</Link>
        </div>
      </div>
    </div>
  );
};

export default EditInvoice;
