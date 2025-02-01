/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from "../../../context/authContext.jsx";
import Preloader from "../../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const AddTeamMember = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [joining, setJoining] = useState("");
  const [dob, setDob] = useState("");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [designation, setDesignation] = useState([]);
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [role, setRole] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [reportingTo, setReportingTo] = useState([]);
  const [selectedReportingTo, setSelectedReportingTo] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [UAN, setUAN] = useState("");
  const [PAN, setPAN] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [department, setDepartment] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [officeLocation, setOfficeLocation] = useState([]);
  const [selectedOfficeLocation, setSelectedOfficeLocation] = useState("");
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState("08:30");
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();
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
    if (!isLoading && team && permissions?.create) {
      fetchAllTeamMember();
      fetchAllDesignation();
      fetchAllRole();
      fetchAllDepartment();
      fetchAllOffice();
    };
  }, [isLoading, team, permissions]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {

      // Validation
      if (!name) {
        return toast.error("Enter employee name");
      };

      if (!email) {
        return toast.error("Enter email");
      };

      if (!password) {
        return toast.error("Enter password");
      };

      if (!mobile) {
        return toast.error("Enter mobile number");
      };

      if (!joining) {
        return toast.error("Enter joining date");
      };

      if (!monthlySalary) {
        return toast.error("Enter monthlySalary");
      };

      if (!dob) {
        return toast.error("Enter date of birth");
      };

      if (!selectedDesignation) {
        return toast.error("Select designation");
      };

      if (!selectedRole) {
        return toast.error("Select role");
      };

      if (!isActive === "") {
        return toast.error("Select active");
      };

      if (!workingHoursPerDay) {
        return toast.error("Select working hours per day");
      };

      if (!selectedOfficeLocation) {
        return toast.error("Select office");
      };

      if (!selectedDepartment) {
        return toast.error("Select department");
      };

      const response = await axios.post(`${base_url}/api/v1/team/create-team`,
        {
          name,
          email,
          password,
          mobile,
          joining,
          dob,
          monthlySalary,
          role: selectedRole,
          designation: selectedDesignation,
          reportingTo: selectedReportingTo,
          office: selectedOfficeLocation,
          department: selectedDepartment,
          UAN,
          PAN,
          bankAccount,
          workingHoursPerDay,
          isActive,
        },
        {
          headers: {
            Authorization: validToken,
          },
        },
      );

      if (response?.data?.success) {
        setName("");
        setEmail("");
        setPassword("");
        setMobile("");
        setJoining("");
        setDob("");
        setMonthlySalary("");
        setSelectedDesignation("");
        setSelectedRole("");
        setSelectedReportingTo([]);
        toast.success("Submitted Successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while creating employee:", error.message);
      toast.error("Error while creating");
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

  if (!permissions?.create) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Add Employee</h4>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="name">Employee Name <span className="text-danger">*</span></label>
              <input type="text" className="form-control" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="email">Email ID <span className="text-danger">*</span></label>
              <input type="email" className="form-control" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="password">Create Password <span className="text-danger">*</span></label>
              <input type="password" className="form-control" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="mobile">Mobile No. <span className="text-danger">*</span></label>
              <input type="text" className="form-control" name="mobile" id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label">Designation <span className="text-danger">*</span></label>
              <select className="form-select" name="designation" value={selectedDesignation} onChange={(e) => setSelectedDesignation(e.target.value)}>
                <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                {
                  designation?.map((d) => (
                    <option key={d?._id} value={d?._id}>{d?.name}</option>
                  ))
                }
              </select>
            </div>
          </div>
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
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="joining">Joining Date <span className="text-danger">*</span></label>
              <input type="date" className="form-control" name="joining" id="joining" value={joining} onChange={(e) => setJoining(e.target.value)} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="dob">Date of Birth <span className="text-danger">*</span></label>
              <input type="date" className="form-control" name="dob" id="dob" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="monthlySalary">Monthly Salary <span className="text-danger">*</span></label>
              <input type="text" className="form-control" name="monthlySalary" id="monthlySalary" value={monthlySalary} onChange={(e) => setMonthlySalary(e.target.value)} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="workingHoursPerDay">Working Hours Per Day <span className="text-danger">*</span></label>
              <input type="time" className="form-control" name="workingHoursPerDay" id="workingHoursPerDay" value={workingHoursPerDay} onChange={(e) => setWorkingHoursPerDay(e.target.value)} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="PAN">PAN</label>
              <input type="text" className="form-control" name="PAN" id="PAN" value={PAN} onChange={(e) => setPAN(e.target.value)} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="UAN">UAN</label>
              <input type="text" className="form-control" name="UAN" id="UAN" value={UAN} onChange={(e) => setUAN(e.target.value)} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="bankAccount">Bank Account</label>
              <input type="text" className="form-control" name="bankAccount" id="bankAccount" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label">Role <span className="text-danger">*</span></label>
              <select className="form-select" name="role" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                {
                  role?.map((r) => (
                    <option key={r?._id} value={r?._id}>{r?.name}</option>
                  ))
                }
              </select>
            </div>
          </div>
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
          <div className="col-md-12">
            <div className="form-wrap">
              <label className="col-form-label">Reporting To <span className="text-danger"></span></label>
              <select className="form-select" name="leader" value="" onChange={handleSelectChange}>
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
                      <button type="button" className="remove-btn" onClick={() => handleRemove(reporting)}>{"x"}</button>
                    </span>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
        <div className="submit-button text-end">
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={(e) => handleCreate(e)}>Submit</Link>
        </div>
      </div>
    </div>
  );
};

export default AddTeamMember;