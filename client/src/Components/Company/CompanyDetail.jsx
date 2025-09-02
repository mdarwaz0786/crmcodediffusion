/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/authContext";
const base_url = import.meta.env.VITE_API_BASE_URL;

const CompanyDetail = () => {
  const { id } = useParams();
  const { validToken, team } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [previewLogo, setPreviewLogo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [numberOfEmployee, setNumberOfEmployee] = useState("");
  const [employeeIdPrefix, setEmployeeIdPrefix] = useState("");
  const [projectIdPrefix, setProjectIdPrefix] = useState("");
  const [punchInTime, setPunchInTime] = useState("");
  const [punchOutTime, setPunchOutTime] = useState("");
  const [halfDayThreshold, setHalfDayThreshold] = useState("");
  const [weeklyOff, setWeeklyOff] = useState([]);
  const [paidLeavePerMonth, setPaidLeavePerMonth] = useState("");
  const [leaveSystemStartDate, setLeaveSystemStartDate] = useState("");

  // fetch all roles
  const fetchAllRole = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/role/all-role`, {
        headers: {
          Authorization: validToken,
        },
      });
      if (response?.data?.success) {
        setRole(response?.data?.role);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  // fetch company details by id
  const fetchCompany = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/company/single-company/${id}`, {
        headers: { Authorization: validToken },
      });

      if (response?.data?.success) {
        const c = response?.data?.data;
        setCompanyName(c?.companyName || "");
        setMobile(c?.mobile || "");
        setEmail(c?.email || "");
        setPassword(c?.password || "");
        setSelectedRole(c?.role?._id || "");
        setNumberOfEmployee(c?.numberOfEmployee || "");
        setProjectIdPrefix(c?.projectIdPrefix || "");
        setEmployeeIdPrefix(c?.employeeIdPrefix || "");
        setPunchInTime(c?.punchInTime || "");
        setPunchOutTime(c?.punchOutTime || "");
        setHalfDayThreshold(c?.halfDayThreshold || "");
        setWeeklyOff(Array.isArray(c?.weeklyOff) ? c?.weeklyOff : []);
        setPaidLeavePerMonth(c?.paidLeavePerMonth || "");
        setLeaveSystemStartDate(c?.leaveSystemStartDate || "");
        if (c?.logo) setPreviewLogo(c?.logo);
      };
    } catch (error) {
      toast.error("Error fetching company details");
    };
  };

  useEffect(() => {
    if (team?.isSuperAdmin) {
      fetchCompany();
      fetchAllRole();
    };
  }, [id, team]);

  if (!team?.isSuperAdmin) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div className="container mt-4">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h4>Company Detail</h4>
            <Link to="#" onClick={() => navigate(-1)}>
              <button className="btn btn-primary">Back</button>
            </Link>
          </div>
          <form className="p-4">
            <div className="row">
              <div className="mb-3 col-md-6">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={companyName}
                />
              </div>

              <div className="mb-3 col-md-6">
                <label className="form-label">Mobile</label>
                <input
                  type="text"
                  className="form-control"
                  value={mobile}
                />
              </div>
            </div>

            <div className="row">
              <div className="mb-3 col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                />
              </div>

              <div className="mb-3 col-md-6">
                <label className="form-label">Password</label>
                <input
                  type="text"
                  className="form-control"
                  value={password}
                />
              </div>
            </div>

            <div className="row">
              <div className="mb-3 col-md-6">
                <label className="form-label">Number Of Employee</label>
                <input
                  type="text"
                  className="form-control"
                  value={numberOfEmployee}
                />
              </div>

              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label">Role</label>
                  <select
                    className="form-select"
                    value={selectedRole}
                  >
                    {role?.map((r) => (
                      <option key={r?._id} value={r?._id}>{r?.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="mb-3 col-md-6">
                <label className="form-label">Employee Id Prefix <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={employeeIdPrefix}
                />
              </div>
              <div className="mb-3 col-md-6">
                <label className="form-label">Project Id Prefix <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={projectIdPrefix}
                />
              </div>
            </div>


            <div className="row">
              <div className="mb-3 col-md-4">
                <label className="form-label">Punch In Time <span className="text-danger">*</span></label>
                <input
                  type="time"
                  className="form-control"
                  value={punchInTime}
                />
              </div>
              <div className="mb-3 col-md-4">
                <label className="form-label">Punch Out Time <span className="text-danger">*</span></label>
                <input
                  type="time"
                  className="form-control"
                  value={punchOutTime}
                />
              </div>
              <div className="mb-3 col-md-4">
                <label className="form-label">Leave System Start Date <span className="text-danger">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  value={leaveSystemStartDate}
                />
              </div>
            </div>

            <div className="row">
              <div className="mb-3 col-md-6">
                <label className="form-label">Half Day Threshold <span className="text-danger">*</span></label>
                <input
                  type="time"
                  className="form-control"
                  value={halfDayThreshold}
                />
              </div>
              <div className="mb-3 col-md-6">
                <label className="form-label">Weekly Off <span className="text-danger">*</span></label>
                <div className="d-flex gap-3">
                  {["Sunday", "Saturday"].map((day) => (
                    <div key={day} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={day}
                        value={day}
                        checked={weeklyOff.includes(day)}
                      />
                      <label className="form-check-label" htmlFor={day}>{day}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="mb-3 col-md-6">
                <label className="form-label">No. Of Paid Leave Per Month <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={paidLeavePerMonth}
                />
              </div>
              <div className="mb-3 col-md-6">
                <label className="form-label">Logo</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                />
                {previewLogo && (
                  <img
                    src={previewLogo}
                    alt="Logo Preview"
                    className="mt-2"
                    style={{ maxWidth: "150px" }}
                  />
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
