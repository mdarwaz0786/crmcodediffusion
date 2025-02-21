/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from '../../Preloader.jsx';
const base_url = import.meta.env.VITE_API_BASE_URL;

const PaySalary = () => {
  const [transactionId, setTransactionId] = useState("");
  const { employeeId, month, year, totalSalary } = useParams();
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (!totalSalary || !month || !year || !employeeId || !transactionId) {
        return toast.error("Enter transaction id");
      };

      const response = await axios.post(`${base_url}/api/v1/salary/create-salary`,
        {
          transactionId: transactionId,
          amountPaid: totalSalary,
          month,
          year,
          employee: employeeId,
          salaryPaid: true,
        },
        {
          headers: {
            Authorization: validToken,
          },
        },
      );

      if (response?.data?.success) {
        setTransactionId("");
        toast.success("Submitted successfully");
        navigate(-1);
      };
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error while submitting");
    } finally {
      setLoading(false);
    };
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (team?.role?.name?.toLowerCase() !== "admin" && team?.role?.name?.toLowerCase() !== "hr") {
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
        <div className="row">
          <div className="col-md-12">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="transactionId">Transaction Id <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        {
          loading ? (
            <div className="text-start">
              <h6>Salary slip is creating and sending...</h6>
            </div>
          ) : (
            <div className="text-start">
              <Link to="#" style={{ marginRight: "1rem" }} onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
              <Link to="#" className="btn btn-primary" onClick={handleCreate}>Submit</Link>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default PaySalary;
