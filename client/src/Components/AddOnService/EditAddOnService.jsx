/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from '../../Preloader.jsx';
import Select from "react-select";
const base_url = import.meta.env.VITE_API_BASE_URL;

const EditAddOnService = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState([]);
  const [project, setProject] = useState([]);
  const [service, setService] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [totalProjectCost, setTotalProjectCost] = useState("");
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();

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

  const fetchAllProject = async (customerId) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/project/all-project`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        const filteredProjects = response?.data?.project?.filter((p) => p?.customer?._id === customerId);
        setProject(filteredProjects);
      };
    } catch (error) {
      console.error("Error while fetching all project:", error.message);
    };
  };

  const fetchAllService = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/service/all-service`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setService(response?.data?.data);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team) {
      fetchAllCustomer();
      fetchAllService();
    };
  }, [isLoading, team]);

  useEffect(() => {
    if (selectedCustomer && !isLoading && team) {
      fetchAllProject(selectedCustomer);
    };
  }, [selectedCustomer, isLoading, team]);

  // Handle project name change
  const handleProjectChange = (selectedOption) => {
    setSelectedProject(selectedOption?.value || "");
  };

  // Project options
  const projectOptions = project?.map((p) => ({
    value: p?._id,
    label: p?.projectName,
  }));

  // Handle client name change
  const handleCustomerChange = (selectedOption) => {
    setSelectedCustomer(selectedOption?.value || "");
  };

  // Customer options
  const customerOptions = customer?.map((c) => ({
    value: c?._id,
    label: c?.name,
  }));

  // Handle service name change
  const handleServiceChange = (selectedOption) => {
    setSelectedService(selectedOption?.value || "");
  };

  // Service options
  const serviceOptions = service?.map((s) => ({
    value: s?._id,
    label: s?.name,
  }));

  const fetchSingleAddOnService = async (id) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/addOnService/single-addOnService/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setSelectedCustomer(response?.data?.data?.clientName?._id);
        setSelectedProject(response?.data?.data?.projectName?._id);
        setSelectedService(response?.data?.data?.serviceName?._id);
        setTotalProjectCost(response?.data?.data?.totalProjectCost);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (id && !isLoading && team) {
      fetchSingleAddOnService(id);
    };
  }, [id, isLoading, team]);

  const handleUpdate = async (e, id) => {
    e.preventDefault();

    try {
      // Validations
      if (!selectedCustomer) {
        return toast.error("Select client");
      };

      if (!selectedProject) {
        return toast.error("Select project");
      };

      if (!selectedService) {
        return toast.error("Select service");
      };

      if (!totalProjectCost) {
        return toast.error("Enter total project cost");
      };

      const response = await axios.put(`${base_url}/api/v1/addOnService/update-addOnService/${id}`,
        {
          clientName: selectedCustomer,
          projectName: selectedProject,
          serviceName: selectedService,
          totalProjectCost,
        },
        {
          headers: {
            Authorization: validToken,
          },
        });

      if (response?.data?.success) {
        setSelectedCustomer("");
        setSelectedProject("");
        setSelectedService("");
        setTotalProjectCost("");
        toast.success("Submitted Successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while creating add on service:", error.message);
      toast.error("Error while creating");
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

  if (!team?.role?.name.toLowerCase() === "admin") {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Add On Service</h4>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="clientName">Client Name <span className="text-danger">*</span></label>
              <Select
                styles={selectStyle}
                className="form-select p-0"
                name="clientName"
                id="clientName"
                options={customerOptions}
                value={customerOptions?.find((option) => option?.value === selectedCustomer)}
                onChange={handleCustomerChange}
                isSearchable
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="projectName">Project Name <span className="text-danger">*</span></label>
              <Select
                styles={selectStyle}
                className="form-select p-0"
                name="projectName"
                id="projectName"
                options={projectOptions}
                value={projectOptions?.find((option) => option?.value === selectedProject)}
                onChange={handleProjectChange}
                isSearchable
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="serviceName">Service Name <span className="text-danger">*</span></label>
              <Select
                styles={selectStyle}
                className="form-select p-0"
                name="serviceName"
                id="serviceName"
                options={serviceOptions}
                value={serviceOptions?.find((option) => option?.value === selectedService)}
                onChange={handleServiceChange}
                isSearchable
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="projectName">Total Project Cost <span className="text-danger">*</span></label>
              <input type="text" className="form-control" name="totalProjectCost" id="totalProjectCost" value={totalProjectCost} onChange={(e) => setTotalProjectCost(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="submit-button text-end">
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={(e) => handleUpdate(e, id)}>Submit</Link>
        </div>
      </div>
    </div>
  );
};

export default EditAddOnService;