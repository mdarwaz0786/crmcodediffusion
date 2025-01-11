/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from '../../Preloader.jsx';
const base_url = import.meta.env.VITE_API_BASE_URL;

const PaySalary = () => {
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const currentYear = new Date().getFullYear();
  const [amountPaid, setAmountPaid] = useState("");
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [employee, setEmployee] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();

  const fetchAllEmployee = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/team/all-team`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setEmployee(response?.data?.team);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && team?.role?.name.toLowerCase() === "admin") {
      fetchAllEmployee();
    };
  }, [isLoading, team, team?.role?.name.toLowerCase() === "admin"]);

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      if (!amountPaid || !month || !year || !selectedEmployee) {
        return toast.error("Please fill all fields");
      };

      const response = await axios.post(`${base_url}/api/v1/salary/create-salary`,
        { amountPaid, month, year, employee: selectedEmployee, salaryPaid: true },
        {
          headers: {
            Authorization: validToken,
          },
        },
      );

      if (response?.data?.success) {
        setAmountPaid("");
        setMonth(currentMonth);
        setYear(currentYear);
        toast.success("Salary submitted successfully");
        navigate(-1);
      };
    } catch (error) {
      console.error("Error while creating salary:", error.message);
      toast.error("Error while submitting salary");
    };
  };

  const generateYearOptions = () => {
    const years = [];
    for (let i = currentYear; i > currentYear - 10; i--) {
      years.push(i);
    };
    return years;
  };

  const monthOptions = [
    { label: 'January', value: '01' },
    { label: 'February', value: '02' },
    { label: 'March', value: '03' },
    { label: 'April', value: '04' },
    { label: 'May', value: '05' },
    { label: 'June', value: '06' },
    { label: 'July', value: '07' },
    { label: 'August', value: '08' },
    { label: 'September', value: '09' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' }
  ];

  if (isLoading) {
    return <Preloader />;
  };

  if (team?.role?.name.toLowerCase() !== "admin") {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Pay Salary</h4>
          <Link to="#" onClick={() => navigate(-1)}>
            <button className="btn btn-primary">Back</button>
          </Link>
        </div>
        {/* Employee */}
        <div className="row">
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="employee">Employee <span className="text-danger">*</span></label>
              <select className="form-select" name="employee" id="employee" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                {
                  employee?.map((e) => (
                    <option key={e?._id} value={e?._id}>{e?.name}</option>
                  ))
                }
              </select>
            </div>
          </div>

          {/* Amount Paid */}
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="amountPaid">Amount Paid <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </div>
          </div>

          {/* Month Selection */}
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="month">Month <span className="text-danger">*</span></label>
              <select
                className="form-select"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Year Selection */}
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="year">Year <span className="text-danger">*</span></label>
              <select
                className="form-select"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {generateYearOptions().map((year, index) => (
                  <option key={index} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="submit-button text-end">
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={handleCreate}>Submit</Link>
        </div>
      </div>
    </div>
  );
};

export default PaySalary;
