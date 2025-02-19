/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import Preloader from "../../Preloader";
const base_url = import.meta.env.VITE_API_BASE_URL;

const getStatusColor = (status) => {
  switch (status) {
    case "Open": return "bg-danger text-white";
    case "In Progress": return "bg-warning text-dark";
    case "Resolved": return "bg-success text-white";
    case "Closed": return "bg-secondary text-white";
    default: return "bg-primary text-white";
  };
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "Low": return "bg-success text-white";
    case "Medium": return "bg-warning text-dark";
    case "High": return "bg-danger text-white";
    default: return "bg-primary text-white";
  };
};

const getTicketTypeColor = (ticketType) => {
  switch (ticketType) {
    case "Bug": return "bg-danger text-white";
    case "Feature Request": return "bg-info text-white";
    case "Improvement": return "bg-success text-white";
    case "Task": return "bg-primary text-white";
    case "Support": return "bg-warning text-dark";
    case "Incident": return "bg-secondary text-white";
    default: return "bg-light text-dark";
  };
};

const SingleTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const permissions = team?.role?.permissions?.ticket;

  const fetchSingleTicket = async (id) => {
    try {
      const response = await axios.get(
        `${base_url}/api/v1/ticket/single-ticket/${id}`,
        { headers: { Authorization: validToken } }
      );

      if (response?.data?.success) {
        setData(response?.data?.ticket);
        setLoading(false);
      };
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    };
  };

  useEffect(() => {
    if (id && permissions?.access) {
      fetchSingleTicket(id);
    };
  }, [id, permissions]);

  const exportTicketDetailAsPdf = () => {
    const element = document.querySelector("#exportTicketDetail");
    const options = {
      filename: `${data?.ticketId}-${data?.project?.projectName}.pdf`,
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

  if (isLoading) {
    return <Preloader />;
  };

  if (!permissions?.access) {
    return <Navigate to="/" />;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}></div>
      </div>
    );
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h4>Ticket Detail</h4>
          {
            permissions?.export && (
              <Link to="#" onClick={exportTicketDetailAsPdf}><button className="btn btn-secondary">Download</button></Link>
            )
          }
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="card border-light rounded p-4 mb-4" id="exportTicketDetail">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 mb-0 text-primary">🎫 Ticket Details</h2>
            <div className="d-flex flex-column align-items-end">
              <div style={{ marginBottom: "0.5rem" }}>
                <strong>Status:</strong>{" "}
                <span className={`badge ${getStatusColor(data?.status)}`}>{data?.status}</span>
              </div>
              <div style={{ marginBottom: "0.5rem" }}>
                <strong>Priority:</strong>{" "}
                <span className={`badge ${getPriorityColor(data?.priority)}`}>{data?.priority}</span>
              </div>
              <div>
                <strong>Ticket Type:</strong>{" "}
                <span className={`badge ${getTicketTypeColor(data?.ticketType)}`}>{data?.ticketType}</span>
              </div>
            </div>
          </div>

          <hr />

          <div className="row g-4">
            <div className="col-md-4">
              <h6 className="text-muted">Ticket ID</h6>
              <p className="fw-bold mb-0">{data?.ticketId}</p>
            </div>
            <div className="col-md-4">
              <h6 className="text-muted">Project Name</h6>
              <p className="fw-bold mb-0">{data?.project?.projectName}</p>
            </div>
            <div className="col-md-4">
              <h6 className="text-muted">Raised By</h6>
              <p className="fw-bold mb-0">{data?.createdBy?.name}</p>
            </div>
          </div>

          <hr />

          <div className="row g-4">
            <div className="col-md-6">
              <h6 className="text-muted">Title</h6>
              <p className="h5 text-primary mb-0">{data?.title}</p>
            </div>
            <div className="col-md-6">
              <h6 className="text-muted">Description</h6>
              <p className="text-secondary mb-0">{data?.description}</p>
            </div>
          </div>

          <hr />

          <div>
            <h6 className="text-muted">Assigned To</h6>
            <div className="d-flex flex-wrap gap-2 mt-1">
              {data?.assignedTo?.length > 0 ? (
                data?.assignedTo?.map((member, index) => (
                  <span
                    key={index}
                    className="badge bg-light text-dark border border-primary"
                    style={{ padding: "0.4rem 1rem", borderRadius: "1rem" }}
                  >
                    {member?.name}
                  </span>
                ))
              ) : (
                <span className="text-muted">Not Assigned</span>
              )}
            </div>
          </div>

          <hr />

          <div className="d-flex justify-content-between text-muted">
            <p className="me-3 mb-0">📅 Created At: {new Date(data?.createdAt).toLocaleString("en-IN")}</p>
            <p className="mb-0">⏱ Last Updated: {new Date(data?.updatedAt).toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleTicket;
