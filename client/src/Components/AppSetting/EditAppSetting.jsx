/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import { toast } from "react-toastify";
import { Navigate, useNavigate, useParams } from "react-router-dom";
const base_url = import.meta.env.VITE_API_BASE_URL;

const EditAppSetting = () => {
  const { id } = useParams();
  const { validToken, team } = useAuth();
  const navigate = useNavigate();
  const [appName, setAppName] = useState("");
  const [appVersion, setAppVersion] = useState("");
  const [playStoreLink, setPlayStoreLink] = useState("");
  const [appStoreLink, setAppStoreLink] = useState("");
  const [iosAppVersion, setIosAppVersion] = useState("");
  const [status, setStatus] = useState("Enable");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(`${base_url}/api/v1/appSetting/update-appSetting/${id}`,
        {
          appName,
          appVersion,
          playStoreLink,
          appStoreLink,
          status,
          iosAppVersion,
        },
        {
          headers: {
            Authorization: validToken,
          },
        });
      if (response?.data?.success) {
        setAppName("");
        setAppVersion();
        setAppStoreLink("");
        setPlayStoreLink("");
        setStatus("");
        setIosAppVersion("");
        toast.success("Submitted successfully");
        navigate(-1);
      };
    } catch (error) {
      toast.error("Error while submitting");
    };
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/appSetting/single-appSetting/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });
      if (response?.data?.success) {
        setAppName(response?.data?.data?.appName);
        setAppVersion(response?.data?.data?.appVersion);
        setPlayStoreLink(response?.data?.data?.playStoreLink);
        setAppStoreLink(response?.data?.data?.appStoreLink);
        setStatus(response?.data?.data?.status);
        setIosAppVersion(response?.data?.data?.iosAppVersion);
      };
    } catch (error) {
      toast.error("Error while submitting");
    };
  };

  useEffect(() => {
    if (id && validToken && team && team?.isSuperAdmin) {
      fetchData();
    };
  }, [id, validToken, team]);

  if (!team?.isSuperAdmin) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", marginTop: "0.5rem" }}>
          <h4>Edit App Setting</h4>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>Back</button>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6 mb-2">
              <label className="form-label" htmlFor="appName">App Name <span className="text-danger">*</span></label>
              <input
                className="form-control"
                type="text"
                id="appName"
                name="appName"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="appVersion">Android App Version <span className="text-danger">*</span></label>
              <input
                className="form-control"
                type="text"
                id="appVersion"
                name="appVersion"
                value={appVersion}
                onChange={(e) => setAppVersion(e.target.value)}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="iosAppVersion">IOS App Version <span className="text-danger">*</span></label>
              <input
                className="form-control"
                type="text"
                id="iosAppVersion"
                name="iosAppVersion"
                value={iosAppVersion}
                onChange={(e) => setIosAppVersion(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="status">Status <span className="text-danger">*</span></label>
              <select className="form-select" name="status" id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Select</option>
                <option value="Enable">Enable</option>
                <option value="Disable">Disable</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-2">
              <label className="form-label" htmlFor="playStoreLink">Play Store Link</label>
              <input
                className="form-control"
                type="text"
                id="playStoreLink"
                name="playStoreLink"
                value={playStoreLink}
                onChange={(e) => setPlayStoreLink(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="appStoreLink">App Store Link</label>
              <input
                className="form-control"
                type="text"
                id="appStoreLink"
                name="appStoreLink"
                value={appStoreLink}
                onChange={(e) => setAppStoreLink(e.target.value)}
              />
            </div>
          </div>
          <button className="btn btn-primary mt-3" type="submit">submit</button>
        </form>
      </div>
    </div>
  );
};

export default EditAppSetting;