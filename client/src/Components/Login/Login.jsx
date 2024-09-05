/* eslint-disable no-extra-semi */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";
import axios from "axios";
import { toast } from 'react-toastify';
import logo from "../../Assets/logo.png";

const Login = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { storeToken } = useAuth();

  // Ensure the employeeId starts with "EmpID" and the rest remains unchanged
  const transformedEmployeeId = `EmpID${employeeId.substring(5)}`;

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/v1/team/login-team", { employeeId: transformedEmployeeId, password });
      if (response?.data?.success) {
        storeToken(response?.data?.token);
        setEmployeeId("");
        setPassword("");
        toast.success(response?.data?.message);
        navigate('/');
        window.location.reload();
      };
    } catch (error) {
      console.log("Error while login:", error.message);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      };
    };
  };

  return (
    <div className="main-wrapper">
      <div className="account-content">
        <div className="login-wrapper account-bg register-bg">
          <div className="login-content">
            <div className="login-user-info">
              <div className="login-logo-custom">
                <img src={logo} className="img-fluid" alt="Logo" />
              </div>
              <div className="login-heading">
                <h4>Login</h4>
                <p>Access the Code Diffusion CRM panel using your employee ID and password.</p>
              </div>
              <div className="form-wrap">
                <label className="col-form-label">Employee ID <span className="text-danger">*</span></label>
                <div className="form-wrap-icon">
                  <input type="text" className="form-control" name="employeeId" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} autoComplete="new-employeeId" />
                </div>
              </div>
              <div className="form-wrap">
                <label className="col-form-label">Password <span className="text-danger">*</span></label>
                <div className="pass-group">
                  <input type="password" className="pass-input form-control" name="password" value={password} onChange={(e) => { setPassword(e.target.value) }} autoComplete="new-password" />
                </div>
              </div>
              <div className="form-wrap">
                <button type="submit" className="btn btn-secondary" onClick={(e) => handleLogin(e)}>Login</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;