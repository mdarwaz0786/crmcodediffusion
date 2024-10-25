/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from "../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const EditProjectDeployment = () => {
  const [websiteName, setWebsiteName] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [domainExpiryDate, setDomainExpiryDate] = useState("");
  const [client, setClient] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();
  const { id } = useParams();
  const permissions = team?.role?.permissions?.projectDeployment;
  const fieldPermissions = team?.role?.permissions?.projectDeployment?.fields;

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

  const fetchSingleProjectDeployment = async (id) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/projectDeployment/single-projectDeployment/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setWebsiteName(response?.data?.projectDeployment?.websiteName);
        setWebsiteLink(response?.data?.projectDeployment?.websiteLink);
        setDomainExpiryDate(response?.data?.projectDeployment?.domainExpiryDate);
        setSelectedClient(response?.data?.projectDeployment?.client?._id);
      };
    } catch (error) {
      console.log("Error while fetching single project deployment:", error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.update && id) {
      fetchSingleProjectDeployment(id);
    };
  }, [id, isLoading, team, permissions]);

  useEffect(() => {
    if (!isLoading && team && permissions?.update) {
      fetchAllClient();
    };
  }, [isLoading, team, permissions]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${base_url}/api/v1/projectDeployment/update-projectDeployment/${id}`, { websiteName, websiteLink, client: selectedClient, domainExpiryDate }, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setWebsiteName("");
        setWebsiteLink("");
        setClient([]);
        setSelectedClient("");
        setDomainExpiryDate();
        toast.success("Submitted Successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while updating project deployment:", error.message);
      toast.error("Error while updating");
    };
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
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Add Project Deployment</h4>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="row">
          {
            (fieldPermissions?.websiteName?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="websiteName">Website Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" name="websiteName" id="websiteName" value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.websiteLink?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="websiteLink">Website Link <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" name="websiteLink" id="websiteLink" value={websiteLink} onChange={(e) => setWebsiteLink(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.domainExpiryDate?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="domainExpiryDate">Domain Expiry Date <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" name="domainExpiryDate" id="domainExpiryDate" value={domainExpiryDate} onChange={(e) => setDomainExpiryDate(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.client?.show) && (
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

export default EditProjectDeployment;