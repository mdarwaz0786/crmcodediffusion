/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { useParams } from "react-router-dom";
const base_url = import.meta.env.VITE_API_BASE_URL;

/* eslint-disable react/prop-types */
const getStatusColor = (status) => {
  switch (status) {
    case "Open":
      return "danger";
    case "In Progress":
      return "warning";
    case "Resolved":
      return "success";
    case "Closed":
      return "secondary";
    default:
      return "primary";
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "Low":
      return "success";
    case "Medium":
      return "warning";
    case "High":
      return "danger";
    default:
      return "primary";
  }
};

const SingleTicket = ({ ticket }) => {
  const { id } = useParams();
  const { validToken } = useAuth();
  const [data, setData] = useState();

  const fetchSingleTicket = async (id) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/ticket/single-ticket/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setData(response?.data?.project);
      };
    } catch (error) {
      console.log("Error while fetching single ticket:", error.message);
    };
  };

  useEffect(() => {
    fetchSingleTicket(id)
  }, [id]);

  console.log(data);

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4">
        <h2 className="text-center text-primary mb-4">Ticket Details</h2>

        {/* Ticket ID */}
        <p>
          <strong>Ticket ID:</strong>{" "}
          <span className="badge bg-dark">{ticket.ticketId}</span>
        </p>

        {/* Title */}
        <h5 className="fw-bold">{ticket.title}</h5>

        {/* Description */}
        <p className="text-muted">{ticket.description}</p>

        {/* Status & Priority */}
        <div className="d-flex justify-content-between">
          <span className={`badge bg-${getStatusColor(ticket.status)}`}>
            {ticket.status}
          </span>
          <span className={`badge bg-${getPriorityColor(ticket.priority)}`}>
            {ticket.priority}
          </span>
        </div>

        {/* Project */}
        <p className="mt-3">
          <strong>Project:</strong> {ticket.project?.projectName || "N/A"}
        </p>

        {/* Assigned Team */}
        <p>
          <strong>Assigned To:</strong>{" "}
          {ticket.assignedTo.length > 0
            ? ticket.assignedTo.map((member, index) => (
              <span key={index} className="badge bg-secondary me-1">
                {member.name}
              </span>
            ))
            : "Not Assigned"}
        </p>

        {/* Created By */}
        <p>
          <strong>Created By:</strong> {ticket.createdBy?.name || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default SingleTicket;
