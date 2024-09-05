/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from "../../Preloader.jsx";
import Select from "react-select";

const AddPayment = () => {
  const [project, setProject] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [projectPrice, setProjectPrice] = useState("");
  const [totalPaid, setTotalPaid] = useState("");
  const [totalDues, setTotalDues] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [payment, setPayment] = useState([{ amount: "", date: "" }]);
  const { validToken, team, isLoading } = useAuth();
  const navigate = useNavigate();
  const permissions = team?.role?.permissions?.project;
  const fieldPermissions = team?.role?.permissions?.project?.fields;

  const fetchAllProject = async () => {
    try {
      const response = await axios.get("/api/v1/project/all-project", {
        headers: {
          Authorization: `${validToken}`,
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
    if (!isLoading && team && permissions?.update && fieldPermissions?.payment?.show) {
      fetchAllProject();
    };
  }, [isLoading, team, permissions, fieldPermissions]);

  const fetchSingleProject = async (selectedProjectId) => {
    try {
      const response = await axios.get(`/api/v1/project/single-project/${selectedProjectId}`, {
        headers: {
          Authorization: `${validToken}`,
        },
      });

      if (response?.data?.success) {
        setProjectId(response?.data?.project?.projectId);
        setProjectPrice(response?.data?.project?.projectPrice);
        setTotalPaid(response?.data?.project?.totalPaid);
        setTotalDues(response?.data?.project?.totalDues);
      };
    } catch (error) {
      console.log("Error while fetching single project:", error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.update && fieldPermissions?.payment?.show && selectedProjectId) {
      fetchSingleProject(selectedProjectId);
    };
  }, [isLoading, team, permissions, fieldPermissions, selectedProjectId]);

  const handlePaymentChange = (e) => {
    if (fieldPermissions?.payment?.read) {
      e.preventDefault();
      return;
    };

    const { name, value } = e.target;
    setPayment((prevPayments) => {
      const updatedPayment = [...prevPayments];
      updatedPayment[0] = { ...updatedPayment[0], [name]: value };
      return updatedPayment;
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

    const payments = payment.filter((pay) => pay.amount.trim() !== "" && pay.date.trim() !== "");

    if (payments.length === 0) {
      return toast.error("All required fields must be filled.");
    };

    // Create update object
    const updateData = {};

    if (fieldPermissions?.payment?.show && !fieldPermissions?.payment?.read) {
      const validPayments = payment.filter((pay) => pay.amount && pay.date);

      if (validPayments.length > 0) {
        updateData.payment = validPayments;
      };
    };

    try {
      const response = await axios.put(`/api/v1/project/update-project/${selectedProjectId}`, updateData, {
        headers: {
          Authorization: `${validToken}`,
        },
      });

      if (response?.data?.success) {
        setSelectedProjectId("");
        setProjectId("");
        setPayment([{ amount: "", date: "" }]);
        toast.success("Added successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while adding payment:", error.message);
      toast.error("Error while adding");
    };
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (!permissions?.update && !fieldPermissions?.payment?.show) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "1rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Add Payment</h4>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="row">
          {
            (fieldPermissions?.projectName?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="project">Project Name <span className="text-danger">*</span></label>
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
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="projectId">Project ID <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="projectId" id="projectId" value={projectId} disabled />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.projectPrice?.show) && (
              <div className="col-md-4">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="projectPrice">Project Cost <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="projectPrice" id="projectPrice" value={`₹${projectPrice}`} disabled />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.totalPaid?.show) && (
              <div className="col-md-4">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="totalPaid">Total Received <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="totalPaid" id="totalPaid" value={`₹${totalPaid}`} disabled />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.totalDues?.show) && (
              <div className="col-md-4">
                <div className="form-wrap" htmlFor="totalDues">
                  <label className="col-form-label" htmlFor="totalDues">Total Dues <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="totalDues" id="totalDues" value={`₹${totalDues}`} disabled />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.payment?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="amount">Amount <span className="text-danger">*</span></label>
                  <input className={`form-control ${fieldPermissions?.payment?.read ? "readonly-style" : ""}`} type="text" name="amount" id="amount" value={payment[0].amount} onChange={handlePaymentChange} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.payment?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="date">Date <span className="text-danger">*</span></label>
                  <input className={`form-control ${fieldPermissions?.payment?.read ? "readonly-style" : ""}`} type="date" name="date" id="date" value={payment[0].date} onChange={handlePaymentChange} />
                </div>
              </div>
            )
          }
        </div>
        <div className="submit-button text-end">
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={(e) => handleUpdate(e, selectedProjectId)}>Add</Link>
        </div>
      </div>
    </div>
  );
};

export default AddPayment;
