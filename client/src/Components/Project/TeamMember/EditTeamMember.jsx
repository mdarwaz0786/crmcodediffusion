/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../../context/authContext.jsx";
import Preloader from "../../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const EditTeamMember = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [joining, setJoining] = useState("");
  const [dob, setDob] = useState("");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [designation, setDesignation] = useState([]);
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [role, setRole] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [password, setPassword] = useState("");
  const [reportingTo, setReportingTo] = useState([]);
  const [selectedReportingTo, setSelectedReportingTo] = useState([]);
  const [isActive, setIsActive] = useState("");
  const [UAN, setUAN] = useState("");
  const [PAN, setPAN] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [department, setDepartment] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [officeLocation, setOfficeLocation] = useState([]);
  const [selectedOfficeLocation, setSelectedOfficeLocation] = useState("");
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState("08:30");
  const { id } = useParams();
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();
  const fieldPermissions = team?.role?.permissions?.team?.fields;
  const permissions = team?.role?.permissions?.team;

  const fetchAllTeamMember = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/team/all-team`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setReportingTo(response?.data?.team);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  const fetchAllDepartment = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/department/all-department`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setDepartment(response?.data?.department);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  const fetchAllOffice = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/officeLocation/all-officeLocation`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setOfficeLocation(response?.data?.officeLocation);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  const fetchAllDesignation = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/designation/all-designation`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setDesignation(response?.data?.designation);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

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
    if (!isLoading && team && permissions?.update) {
      fetchAllTeamMember();
      fetchAllDesignation();
      fetchAllRole();
      fetchAllDepartment();
      fetchAllOffice();
    };
  }, [isLoading, team, permissions]);

  const fetchSingleData = async (id) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/team/single-team/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setEmployeeId(response?.data?.team?.employeeId);
        setName(response?.data?.team?.name);
        setEmail(response?.data?.team?.email);
        setMobile(response?.data?.team?.mobile);
        setJoining(response?.data?.team?.joining);
        setDob(response?.data?.team?.dob);
        setUAN(response?.data?.team?.UAN);
        setPAN(response?.data?.team?.PAN);
        setBankAccount(response?.data?.team?.bankAccount);
        setIsActive(response?.data?.team?.isActive);
        setMonthlySalary(response?.data?.team?.monthlySalary);
        setSelectedDesignation(response?.data?.team?.designation?._id);
        setSelectedDepartment(response?.data?.team?.department?._id);
        setSelectedOfficeLocation(response?.data?.team?.office?._id);
        setPassword(response?.data?.team?.password);
        setSelectedRole(response?.data?.team?.role?._id);
        setSelectedReportingTo(response?.data?.team?.reportingTo?.map((r) => r?._id));
      };
    } catch (error) {
      console.log("Error while fetching single team:", error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.update && id) {
      fetchSingleData(id);
    };
  }, [id, isLoading, team, permissions]);

  const handleUpdate = async (e, id) => {
    e.preventDefault();

    // Create update object
    const updateData = {
      name,
      email,
      mobile,
      joining,
      dob,
      monthlySalary,
      designation: selectedDesignation,
      password,
      reportingTo: selectedReportingTo,
      role: selectedRole,
      UAN,
      PAN,
      bankAccount,
      office: selectedOfficeLocation,
      department: selectedDepartment,
    };

    try {
      const response = await axios.put(`${base_url}/api/v1/team/update-team/${id}`, updateData, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        toast.success("Submitted successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while updating employee:", error.message);
      toast.error("Error while submitting");
    };
  };

  const handleSelectChange = (e) => {
    const value = e.target.value;
    if (value && !selectedReportingTo?.includes(value)) {
      setSelectedReportingTo([...selectedReportingTo, value]);
    };
  };

  const handleRemove = (value) => {
    setSelectedReportingTo(selectedReportingTo?.filter((item) => item !== value));
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
          <h4>Update Employee</h4>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="row">
          {
            (fieldPermissions?.name?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="name">Employee Name <span className="text-danger">*</span></label>
                  <input type="text" className={`form-control ${fieldPermissions?.name?.read ? "readonly-style" : ""}`} placeholder="Enter Name" name="name" id="name" value={name} onChange={(e) => fieldPermissions?.name?.read ? null : setName(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.name?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="employeeId">Employee ID <span className="text-danger"></span></label>
                  <input type="text" className={`form-control ${fieldPermissions?.employeeId?.read ? "readonly-style" : ""}`} placeholder="Enter Employee Id" name="employeeId" id="employeeId" value={employeeId} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.email?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="email">Email ID <span className="text-danger">*</span></label>
                  <input type="email" className={`form-control ${fieldPermissions?.email?.read ? "readonly-style" : ""}`} placeholder="Enter Email" name="email" id="email" value={email} onChange={(e) => fieldPermissions?.email?.read ? null : setEmail(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.password?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="password">Password <span className="text-danger">*</span></label>
                  <input type="text" className={`form-control ${fieldPermissions?.password?.read ? "readonly-style" : ""}`} name="password" id="password" value={password} onChange={(e) => fieldPermissions?.password?.read ? null : setPassword(e.target.value)} autoComplete="new-password" />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.mobile?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="mobile">Mobile No. <span className="text-danger">*</span></label>
                  <input type="text" className={`form-control ${fieldPermissions?.mobile?.read ? "readonly-style" : ""}`} placeholder="Enter Mobile Number" name="mobile" id="mobile" value={mobile} onChange={(e) => fieldPermissions?.mobile?.read ? null : setMobile(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.designation?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label">Designation <span className="text-danger">*</span></label>
                  <select className={`form-select ${fieldPermissions?.designation?.read ? "readonly-style" : ""}`} name="designation" value={selectedDesignation} onChange={(e) => fieldPermissions?.designation?.read ? null : setSelectedDesignation(e.target.value)} >
                    <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                    {
                      designation?.map((d) => (
                        <option key={d?._id} value={d?._id}>{d?.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.department?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label">Department <span className="text-danger">*</span></label>
                  <select className="form-select" name="department" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                    <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                    {
                      department?.map((d) => (
                        <option key={d?._id} value={d?._id}>{d?.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.office?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label">Office <span className="text-danger">*</span></label>
                  <select className="form-select" name="officeLocation" value={selectedOfficeLocation} onChange={(e) => setSelectedOfficeLocation(e.target.value)}>
                    <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                    {
                      officeLocation?.map((o) => (
                        <option key={o?._id} value={o?._id}>{o?.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.joining?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="joining">Joining Date <span className="text-danger">*</span></label>
                  <input type="date" className={`form-control ${fieldPermissions?.joining?.read ? "readonly-style" : ""}`} name="joining" id="joining" value={joining} onChange={(e) => fieldPermissions?.joining?.read ? null : setJoining(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.dob?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="dob">Date of Birth <span className="text-danger">*</span></label>
                  <input type="date" className={`form-control ${fieldPermissions?.dob?.read ? "readonly-style" : ""}`} name="dob" id="dob" value={dob} onChange={(e) => fieldPermissions?.dob?.read ? null : setDob(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.monthlySalary?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="dob">Monthly Salary <span className="text-danger">*</span></label>
                  <input type="text" className={`form-control ${fieldPermissions?.monthlySalary?.read ? "readonly-style" : ""}`} name="monthlySalary" id="monthlySalary" value={monthlySalary} onChange={(e) => fieldPermissions?.monthlySalary?.read ? null : setMonthlySalary(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.workingHoursPerDay?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="workingHoursPerDay">Working Hours Per Day <span className="text-danger">*</span></label>
                  <input type="time" className="form-control" name="workingHoursPerDay" id="workingHoursPerDay" value={workingHoursPerDay} onChange={(e) => setWorkingHoursPerDay(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.PAN?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="PAN">PAN</label>
                  <input type="text" className="form-control" name="PAN" id="PAN" value={PAN} onChange={(e) => setPAN(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.UAN?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="UAN">UAN</label>
                  <input type="text" className="form-control" name="UAN" id="UAN" value={UAN} onChange={(e) => setUAN(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.bankAccount?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="bankAccount">Bank Account</label>
                  <input type="text" className="form-control" name="bankAccount" id="bankAccount" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.isActive?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label">Active <span className="text-danger">*</span></label>
                  <select className="form-select" name="isActive" value={isActive} onChange={(e) => setIsActive(e.target.value)}>
                    <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                    <option value={true}>Yes</option>
                    <option value={false}>No</option>
                  </select>
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.role?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label">Role <span className="text-danger">*</span></label>
                  <select className={`form-select ${fieldPermissions?.role?.read ? "readonly-style" : ""}`} name="role" value={selectedRole} onChange={(e) => fieldPermissions?.role?.read ? null : setSelectedRole(e.target.value)} >
                    <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                    {
                      role?.map((r) => (
                        <option key={r?._id} value={r?._id}>{r?.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.reportingTo?.show) && (
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label">Reporting To <span className="text-danger"></span></label>
                  <select className={`form-select ${fieldPermissions?.reportingTo?.read ? "readonly-style" : ""}`} name="leader" value="" onChange={(e) => fieldPermissions?.reportingTo?.read ? null : handleSelectChange(e)} >
                    <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                    {
                      reportingTo?.filter((r) => !selectedReportingTo.includes(r?._id)).map((r) => (
                        <option key={r?._id} value={r?._id}>{r?.name}</option>
                      ))
                    }
                  </select>
                  <div className="selected-container">
                    {
                      selectedReportingTo?.map((reporting, index) => (
                        <span key={index} className="selected-item">
                          {reportingTo?.find((r) => r?._id === reporting)?.name}
                          {(fieldPermissions?.reportingTo?.read) ? (null) : (<button type="button" className="remove-btn" onClick={() => fieldPermissions?.reportingTo?.read ? null : handleRemove(reporting)} >{"x"}</button>)}
                        </span>
                      ))
                    }
                  </div>
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

export default EditTeamMember;