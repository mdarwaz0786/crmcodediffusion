/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/authContext";
const base_url = import.meta.env.VITE_API_BASE_URL;

const AddCompany = () => {
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
  const [logo, setLogo] = useState();

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

  useEffect(() => {
    fetchAllRole();
  }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setPreviewLogo(URL.createObjectURL(file));
    };
  };

  console.log(leaveSystemStartDate);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyName) {
      return toast.error("Enter company name");
    };

    if (!email) {
      return toast.error("Enter email");
    };

    if (!mobile) {
      return toast.error("Enter mobile");
    };

    if (!password) {
      return toast.error("Enter password");
    };

    if (!selectedRole) {
      return toast.error("Select role");
    };

    if (!numberOfEmployee) {
      return toast.error("Enter number of employee");
    };

    if (!logo) {
      return toast.error("Upload logo");
    };

    if (!employeeIdPrefix) {
      return toast.error("Enter employee id prefix");
    };

    if (!projectIdPrefix) {
      return toast.error("Enter project id prefix");
    };

    if (!punchInTime) {
      return toast.error("Punch In Time is required");
    };

    if (!punchOutTime) {
      return toast.error("Punch Out Time is required");
    };

    if (!halfDayThreshold) {
      return toast.error("Half Day Threshold is required");
    };

    if (!weeklyOff) {
      return toast.error("Weekly off is required");
    };

    if (!paidLeavePerMonth) {
      return toast.error("No. Of Paid Leave Per Month is required");
    };

    if (!leaveSystemStartDate) {
      return toast.error("Leave System Start Date is required");
    };

    if (typeof Number(paidLeavePerMonth) !== "number") {
      return toast.error("No. Of Paid Leave Per Month shoubld be a number");
    };

    const payload = new FormData();
    payload.append("companyName", companyName);
    payload.append("mobile", mobile);
    payload.append("email", email);
    payload.append("password", password);
    payload.append("role", selectedRole);
    payload.append("numberOfEmployee", numberOfEmployee);
    payload.append("employeeIdPrefix", employeeIdPrefix);
    payload.append("projectIdPrefix", projectIdPrefix);
    payload.append("punchInTime", punchInTime);
    payload.append("punchOutTime", punchOutTime);
    payload.append("halfDayThreshold", halfDayThreshold);
    weeklyOff.forEach((day) => payload.append("weeklyOff", day));
    payload.append("paidLeavePerMonth", paidLeavePerMonth);
    payload.append("leaveSystemStartDate", leaveSystemStartDate);
    if (logo) payload.append("logo", logo);

    try {
      await axios.post(`${base_url}/api/v1/company/create-company`, payload, {
        headers: {
          Authorization: validToken,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Company created Successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error creating company");
    };
  };

  if (!team?.isSuperAdmin) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div className="container mt-4">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h4>Register New Company</h4>
            <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
          </div>
          <form onSubmit={handleSubmit} className="p-4">
            <div className="row">
              <div className="mb-3 col-md-6">
                <label className="form-label">Company Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3 col-md-6">
                <label className="form-label">Mobile <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="mb-3 col-md-6">
                <label className="form-label">Email <span className="text-danger">*</span></label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 col-md-6">
                <label className="form-label">Password <span className="text-danger">*</span></label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="mb-3 col-md-6">
                <label className="form-label">Number Of Employee <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="numberOfEmployee"
                  value={numberOfEmployee}
                  onChange={(e) => setNumberOfEmployee(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label">Role <span className="text-danger">*</span></label>
                  <select className="form-select" name="role" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} required>
                    <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                    {
                      role?.map((r) => (
                        <option key={r?._id} value={r?._id}>{r?.name}</option>
                      ))
                    }
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
                  name="employeeIdPrefix"
                  value={employeeIdPrefix}
                  onChange={(e) => setEmployeeIdPrefix(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 col-md-6">
                <label className="form-label">Project Id Prefix <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="projectIdPrefix"
                  value={projectIdPrefix}
                  onChange={(e) => setProjectIdPrefix(e.target.value)}
                  required
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
                  onChange={(e) => setPunchInTime(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 col-md-4">
                <label className="form-label">Punch Out Time <span className="text-danger">*</span></label>
                <input
                  type="time"
                  className="form-control"
                  value={punchOutTime}
                  onChange={(e) => setPunchOutTime(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 col-md-4">
                <label className="form-label">Leave System Start Date <span className="text-danger">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  value={leaveSystemStartDate}
                  onChange={(e) => setLeaveSystemStartDate(e.target.value)}
                  required
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
                  onChange={(e) => setHalfDayThreshold(e.target.value)}
                  required
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
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWeeklyOff([...weeklyOff, day]);
                          } else {
                            setWeeklyOff(weeklyOff.filter((d) => d !== day));
                          }
                        }}
                      />
                      <label className="form-check-label" htmlFor={day}>{day}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="mb-3 col-md-6">
                <label className="form-label">No Of Paid Leave Per Month <span className="text-danger">*</span></label>
                <input
                  type="number"
                  className="form-control"
                  value={paidLeavePerMonth}
                  onChange={(e) => setPaidLeavePerMonth(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 col-md-6">
                <label className="form-label">Logo</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  required
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
            <div style={{ display: "flex", justifyContent: "flex-end", columnGap: "1rem" }}>
              <button className="btn btn-light" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCompany;
