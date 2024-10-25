/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from "../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const AddProjectDeployment = () => {
  const [websiteName, setWebsiteName] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [domainExpiryDate, setDomainExpiryDate] = useState("");
  const [client, setClient] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();
  const permissions = team?.role?.permissions?.projectDeployment;

  const fetchAllClient = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/customer/all-customer`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setClient(response?.data?.customer);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.create) {
      fetchAllClient();
    };
  }, [isLoading, team, permissions]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {

      // Validation
      if (!websiteName) {
        return toast.error("Enter website name");
      };

      if (!websiteLink) {
        return toast.error("Enter website link");
      };

      if (!selectedClient) {
        return toast.error("Select client");
      };

      if (!domainExpiryDate) {
        return toast.error("Enter domain expiry date");
      };

      const response = await axios.post(`${base_url}/api/v1/projectDeployment/create-projectDeployment`, { websiteName, websiteLink, client: selectedClient, domainExpiryDate }, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setWebsiteName("");
        setWebsiteLink("");
        setClient([]);
        setDomainExpiryDate();
        toast.success("Submitted Successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while creating project deployment:", error.message);
      toast.error("Error while creating");
    };
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (!permissions?.create) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Add Project Deployment</h4>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="websiteName">Website Name <span className="text-danger">*</span></label>
              <input type="text" className="form-control" name="websiteName" id="websiteName" value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="websiteLink">Website Link <span className="text-danger">*</span></label>
              <input type="text" className="form-control" name="websiteLink" id="websiteLink" value={websiteLink} onChange={(e) => setWebsiteLink(e.target.value)} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="domainExpiryDate">Domain Expiry Date <span className="text-danger">*</span></label>
              <input type="date" className="form-control" name="domainExpiryDate" id="domainExpiryDate" value={domainExpiryDate} onChange={(e) => setDomainExpiryDate(e.target.value)} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label">Client <span className="text-danger">*</span></label>
              <select className="form-select" name="role" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
                <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                {
                  client?.map((c) => (
                    <option key={c?._id} value={c?._id}>{c?.name}</option>
                  ))
                }
              </select>
            </div>
          </div>
        </div>
        <div className="submit-button text-end">
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={(e) => handleCreate(e)}>Submit</Link>
        </div>
      </div>
    </div>
  );
};

export default AddProjectDeployment;