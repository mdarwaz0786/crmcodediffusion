/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/authContext.jsx";
import html2pdf from "html2pdf.js";
const base_url = import.meta.env.VITE_API_BASE_URL;

const SingleLeed = () => {
  const navigate = useNavigate();
  const { team } = useAuth();
  const { id } = useParams();
  const [leed, setLeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const permissions = team?.role?.permissions?.leeds;

  const fetchLeed = async () => {
    try {
      const res = await axios.get(`${base_url}/api/v1/leed/single-leed/${id}`);
      if (res?.data?.success) {
        setLeed(res?.data?.data);
      };
    } catch (error) {
      setError("Failed to load Leads.");
    } finally {
      setLoading(false);
    };
  };

  useEffect(() => {
    if (id && permissions?.access) {
      fetchLeed();
    };
  }, [id, permissions]);

  const exportLeedDetailAsPdf = () => {
    const element = document.querySelector("#exportLeedsList");
    const options = {
      filename: `${leed?.fname}-${leed?.lname}-leads.pdf`,
      margin: [10, 10, 10, 10],
      html2canvas: {
        useCORS: true,
        scale: 4,
      },
      jsPDF: {
        orientation: 'portrait',
        unit: 'pt',
        format: 'a3',
      },
    };
    if (element) {
      html2pdf().set(options).from(element).save();
    };
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  };

  if (error || !leed) {
    return (
      <div className="alert alert-danger text-center mt-5" role="alert">
        {error || "Lead not found"}
      </div>
    );
  };

  if (!team?.isSuperAdmin) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper">
      <div className="content" id="exportLeedsList">
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h4>Leads Detail</h4>
            {
              permissions?.export && (
                <Link to="#" onClick={exportLeedDetailAsPdf}><button className="btn btn-secondary">Download</button></Link>
              )
            }
            <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
          </div>
          <div className="card rounded">
            <div className="card-body">
              <h3 className="card-title mb-1">
                {leed?.fname} {leed?.lname} {(!leed?.fname || !leed?.lname) && "Unknown"}
              </h3>
              <ul className="list-group list-group-flush mb-3">
                <li className="list-group-item">
                  <strong>📞 Mobile:</strong> {leed?.mobile || "N/A"}
                </li>
                <li className="list-group-item">
                  <strong>📧 Email:</strong> {leed?.email || "N/A"}
                </li>
                <li className="list-group-item">
                  <strong>📝 Message:</strong> {leed?.message || "N/A"}
                </li>
              </ul>
              <p className="text-muted small">
                Created at: {new Date(leed?.createdAt).toLocaleString()} <br />
                Updated at: {new Date(leed?.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleLeed;
