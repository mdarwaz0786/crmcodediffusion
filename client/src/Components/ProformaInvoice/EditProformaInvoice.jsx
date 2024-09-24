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

const EditProformaInvoice = () => {
  const [project, setProject] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [customer, setCustomer] = useState("");
  const [projectPrice, setProjectPrice] = useState("");
  const [totalPaid, setTotalPaid] = useState("");
  const [totalDues, setTotalDues] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [amount, setAmount] = useState("");
  const [tax, setTax] = useState("Inclusive");
  const [date, setDate] = useState("");
  const { validToken, team, isLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const permissions = team?.role?.permissions?.proformaInvoice;
  const fieldPermissions = team?.role?.permissions?.proformaInvoice?.fields;

  const fetchAllProject = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/project/all-project`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        const filteredProject = response?.data?.project?.filter((p) => {
          const isLeader = p?.teamLeader?.some((l) => l?._id === team?._id);
          const isResponsible = p?.responsiblePerson?.some((r) => r?._id === team?._id);
          return isLeader || isResponsible;
        });
        if (team?.role?.name.toLowerCase() === "coordinator" || team?.role?.name.toLowerCase() === "admin") {
          setProject(response?.data?.project);
        } else {
          setProject(filteredProject);
        };
      };
    } catch (error) {
      console.log("Error while fetching all project:", error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.update) {
      fetchAllProject();
    };
  }, [isLoading, team, permissions]);

  const fetchSingleProject = async (selectedProjectId) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/project/single-project/${selectedProjectId}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setProjectId(response?.data?.project?.projectId);
        setProjectPrice(response?.data?.project?.projectPrice);
        setTotalPaid(response?.data?.project?.totalPaid);
        setTotalDues(response?.data?.project?.totalDues);
        setCustomer(response?.data?.project?.customer?.name);
      };
    } catch (error) {
      console.log("Error while fetching single project:", error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.update && selectedProjectId) {
      fetchSingleProject(selectedProjectId);
    };
  }, [isLoading, team, permissions, selectedProjectId]);

  const fetchSingleInvoicve = async (id) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/proformaInvoice/single-proformaInvoice/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setAmount(response?.data?.invoice?.amount);
        setSelectedProjectId(response?.data?.invoice?.project?._id);
        setTax(response?.data?.invoice?.tax);
        setDate(response?.data?.invoice?.date);
      };
    } catch (error) {
      console.log("Error while fetching single proforma invoice:", error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.update && id) {
      fetchSingleInvoicve(id);
    };
  }, [id, isLoading, team, permissions]);

  // Handle project change
  const handleProjectChange = (selectedOption) => {
    setSelectedProjectId(selectedOption?.value || "");
  };

  // Project options
  const projectOptions = project?.map((p) => ({
    value: p?._id,
    label: p?.projectName,
  }));

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    try {
      const invoiceData = {
        project: selectedProjectId,
        amount: parseFloat(amount),
        tax: tax,
        date,
      };

      if (!selectedProjectId) {
        return toast.error("Select project name");
      };

      if (parseFloat(amount) < 1) {
        return toast.error("Amount should not less than 1.");
      };

      if (parseFloat(amount) > parseFloat(totalDues)) {
        return toast.error("Amount should not greater than Total Dues.");
      };

      if (!tax) {
        return toast.error("Select tax");
      };

      if (!tax) {
        return toast.error("Select tax");
      };

      if (!date) {
        return toast.error("Enter date");
      };

      const response = await axios.put(`${base_url}/api/v1/proformaInvoice/update-proformaInvoice/${id}`, invoiceData, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        toast.success("Submitted successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while updationg proforma invoice:", error.message);
      toast.error("Error while submitting");
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
          <h4>Update Proforma Invoice</h4>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="row">
          {
            (fieldPermissions?.project?.show) && (
              <div className="col-md-4">
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
            (fieldPermissions?.project?.show) && (
              <div className="col-md-4">
                <div className="form-wrap" htmlFor="projectId">
                  <label className="col-form-label" htmlFor="projectId">Project ID <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="projectId" id="projectId" value={projectId} disabled />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.project?.show) && (
              <div className="col-md-4">
                <div className="form-wrap" htmlFor="customer">
                  <label className="col-form-label" htmlFor="customer">Client Name<span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="customer" id="customer" value={customer} disabled />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.project?.show) && (
              <div className="col-md-4">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="projectPrice">Project Cost <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="projectPrice" id="projectPrice" value={`₹${projectPrice}`} disabled />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.project?.show) && (
              <div className="col-md-4">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="totalPaid">Total Received <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="totalPaid" id="totalPaid" value={`₹${totalPaid}`} disabled />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.project?.show) && (
              <div className="col-md-4">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="totalDues">Total Dues <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="totalDues" id="totalDues" value={`₹${totalDues}`} disabled />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.amount?.show) && (
              <div className="col-md-4">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="amount">Amount <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" name="amount" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  {
                    (parseFloat(amount) < 1) && (
                      <div className="col-form-label" style={{ color: "red" }}>Amount should not less than 1. <i className="fas fa-times"></i></div>
                    )
                  }
                  {
                    (parseFloat(amount) > parseFloat(totalDues)) && (
                      <div className="col-form-label" style={{ color: "red" }}>Amount should not greater than Total Dues. <i className="fas fa-times"></i></div>
                    )
                  }
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.tax?.show) && (
              <div className="col-md-4">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="tax">Tax <span className="text-danger">*</span></label>
                  <select className="form-select" name="tax" id="tax" value={tax} onChange={(e) => setTax(e.target.value)}>
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
              <div className="col-md-4">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="date">Date <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" name="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
            )
          }
        </div>
        <div className="submit-button text-end">
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={(e) => handleUpdate(e, id)}>Submit</Link>
        </div>
      </div>
    </div>
  );
};

export default EditProformaInvoice;
