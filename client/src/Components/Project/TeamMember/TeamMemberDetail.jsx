/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
/* eslint-disable react/prop-types */
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Preloader from "../../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;
import axios from "axios";
import { useAuth } from "../../../context/authContext.jsx";
import { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import formatDate from "../../../Helper/formatDate.js";
import formatTimeToHoursMinutes from "../../../Helper/formatTimeToHoursMinutes.js";

const TeamMemberDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [teamMember, setTeamMember] = useState("");
  const [leaveBalance, setLeaveBalance] = useState(null);
  const { validToken, team, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const permissions = team?.role?.permissions?.team;

  const fetchTeamMemberData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/v1/team/single-team/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setTeamMember(response?.data?.team);
        setLoading(false);
      };
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    };
  };

  const fetchLeaveBalanceData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/v1/leave/leaveBalance/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setLeaveBalance(response?.data);
        setLoading(false);
      };
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    };
  };

  useEffect(() => {
    if (validToken && id && permissions?.access) {
      fetchTeamMemberData();
      fetchLeaveBalanceData();
    };
  }, [validToken, id, permissions]);

  const exportTeamMemberDetailAsPdf = () => {
    const element = document.querySelector("#exportTeamMemberDetail");
    const options = {
      filename: `${teamMember?.name}.pdf`,
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
    return <p className="text-center mt-5">Loading employee details...</p>;
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (!permissions?.access) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h4>Employee Detail</h4>
          <Link to="#" onClick={exportTeamMemberDetailAsPdf}><button className="btn btn-secondary">Download</button></Link>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="card rounded-3" id="exportTeamMemberDetail">
          <div className="card-header bg-secondary text-white text-center">
            <i className="bi bi-person-circle fs-1"></i>
            <h4 className="text-white mt-2">Employee Details</h4>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <DetailItem label="Employee ID" value={teamMember?.employeeId} />
              <DetailItem label="Name" value={teamMember?.name} />
              <DetailItem label="Email" value={teamMember?.email} />
              <DetailItem label="Mobile" value={teamMember?.mobile} />
              <DetailItem label="Password" value={teamMember?.password} />
              <DetailItem label="Monthly Salary" value={teamMember?.monthlySalary} />
              <DetailItem label="Working Hours/Day" value={formatTimeToHoursMinutes(teamMember?.workingHoursPerDay)} />
              <DetailItem label="Joining Date" value={formatDate(teamMember?.joining)} />
              <DetailItem label="Date of Birth" value={formatDate(teamMember?.dob)} />
              <DetailItem label="Department" value={teamMember?.department?.name} />
              <DetailItem label="Designation" value={teamMember?.designation?.name} />
              <DetailItem label="Office" value={teamMember?.office?.name} />
              <DetailItem label="Active" value={teamMember?.isActive ? "Yes" : "No"} />
              <DetailItem label="Total Leave Credited" value={leaveBalance?.totalEntitled} />
              <DetailItem label="Total Leave Debited" value={leaveBalance?.totalTaken} />
              <DetailItem label="Available Leave Balance" value={leaveBalance?.balance} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for displaying fields
const DetailItem = ({ label, value }) => (
  <div className="col-md-6">
    <div className="border rounded-2 p-3 bg-light">
      <strong>{label}:</strong>
      <p className="text-muted mb-0">{value || "N/A"}</p>
    </div>
  </div>
);

export default TeamMemberDetail;
