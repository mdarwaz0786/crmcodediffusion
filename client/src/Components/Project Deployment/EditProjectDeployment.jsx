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
  const [domainPurchaseDate, setDomainPurchaseDate] = useState("");
  const [domainExpiryDate, setDomainExpiryDate] = useState("");
  const [hostingPurchaseDate, setHostingPurchaseDate] = useState("");
  const [hostingExpiryDate, setHostingExpiryDate] = useState("");
  const [sslPurchaseDate, setSslPurchaseDate] = useState("");
  const [sslExpiryDate, setSslExpiryDate] = useState("");
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
        setDomainPurchaseDate(response?.data?.projectDeployment?.domainPurchaseDate);
        setDomainExpiryDate(response?.data?.projectDeployment?.domainExpiryDate);
        setHostingPurchaseDate(response?.data?.projectDeployment?.hostingPurchaseDate);
        setHostingExpiryDate(response?.data?.projectDeployment?.hostingExpiryDate);
        setSslPurchaseDate(response?.data?.projectDeployment?.sslPurchaseDate);
        setSslExpiryDate(response?.data?.projectDeployment?.sslExpiryDate);
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
      const response = await axios.put(`${base_url}/api/v1/projectDeployment/update-projectDeployment/${id}`, { websiteName, websiteLink, client: selectedClient, domainPurchaseDate, domainExpiryDate, hostingPurchaseDate, hostingExpiryDate, sslPurchaseDate, sslExpiryDate }, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setWebsiteName("");
        setWebsiteLink("");
        setClient([]);
        setDomainPurchaseDate();
        setDomainExpiryDate();
        setHostingPurchaseDate();
        setHostingExpiryDate();
        setSslPurchaseDate();
        setSslExpiryDate();
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0rem 2rem 1rem 2rem" }}>
          <h4>Edit Project Deployment</h4>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="row mb-3" style={{ margin: "0rem 1.5rem" }}>
          {
            (fieldPermissions?.websiteName?.show) && (
              <div className="col-md-4">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="websiteName">Website Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" name="websiteName" id="websiteName" value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.websiteLink?.show) && (
              <div className="col-md-4">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="websiteLink">Website Link <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" name="websiteLink" id="websiteLink" value={websiteLink} onChange={(e) => setWebsiteLink(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.client?.show) && (
              <div className="col-md-4">
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
        <div className="row mb-5" style={{ position: "relative", margin: "0rem 1rem", padding: "2rem 1rem 1rem 1rem", border: "1px solid #e3e3e3", borderRadius: "0.5rem", }}>
          <h6 style={{
            position: "absolute",
            top: "-0.75rem",
            left: "1rem",
            fontSize: "1rem",
            fontWeight: "600",
            backgroundColor: "#F9F9FC",
            padding: "0px 8px 0px 12px",
            color: "#262A2A",
            width: "5.4rem",
          }}>Domain</h6>
          {
            (fieldPermissions?.domainPurchaseDate?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="domainPurchaseDate">Domain Purchase Date <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" name="domainPurchaseDate" id="domainPurchaseDate" value={domainPurchaseDate} onChange={(e) => setDomainPurchaseDate(e.target.value)} />
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
        </div>
        <div className="row mb-5" style={{ position: "relative", margin: "0rem 1rem", padding: "2rem 1rem 1rem 1rem", border: "1px solid #e3e3e3", borderRadius: "0.5rem", }}>
          <h6 style={{
            position: "absolute",
            top: "-0.75rem",
            left: "1rem",
            fontSize: "1rem",
            fontWeight: "600",
            backgroundColor: "#F9F9FC",
            padding: "0px 8px 0px 12px",
            color: "#262A2A",
            width: "5.4rem",
          }}>Hosting</h6>
          {
            (fieldPermissions?.hostingPurchaseDate?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="hostingPurchaseDate">Hosting Purchase Date <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" name="hostingPurchaseDate" id="hostingPurchaseDate" value={hostingPurchaseDate} onChange={(e) => setHostingPurchaseDate(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.hostingExpiryDate?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="hostingExpiryDate">Hosting Expiry Date <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" name="hostingExpiryDate" id="hostingExpiryDate" value={hostingExpiryDate} onChange={(e) => setHostingExpiryDate(e.target.value)} />
                </div>
              </div>
            )
          }
        </div>
        <div className="row mb-5" style={{ position: "relative", margin: "0rem 1rem", padding: "2rem 1rem 1rem 1rem", border: "1px solid #e3e3e3", borderRadius: "0.5rem" }}>
          <h6 style={{
            position: "absolute",
            top: "-0.75rem",
            left: "1rem",
            fontSize: "1rem",
            fontWeight: "600",
            backgroundColor: "#F9F9FC",
            padding: "0px 8px 0px 12px",
            color: "#262A2A",
            width: "2.6rem",
          }}>SSl</h6>
          {
            (fieldPermissions?.sslPurchaseDate?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="sslPurchaseDate">SSL Purchase Date <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" name="sslPurchaseDate" id="sslPurchaseDate" value={sslPurchaseDate} onChange={(e) => setSslPurchaseDate(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.sslExpiryDate?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="sslExpiryDate">SSL Expiry Date <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" name="sslExpiryDate" id="sslExpiryDate" value={sslExpiryDate} onChange={(e) => setSslExpiryDate(e.target.value)} />
                </div>
              </div>
            )
          }
        </div>
        <div className="submit-button text-end" style={{ margin: "0rem 2rem 0rem 0rem" }}>
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={(e) => handleUpdate(e, id)}>Submit</Link>
        </div>
      </div>
    </div>
  );
};

export default EditProjectDeployment;