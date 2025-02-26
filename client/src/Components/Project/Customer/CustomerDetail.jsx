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

const CustomerDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [customer, setCustomer] = useState("");
  const { validToken, team, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const permissions = team?.role?.permissions?.customer;

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/v1/customer/single-customer/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setCustomer(response?.data?.customer);
        setLoading(false);
      };
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    };
  };

  useEffect(() => {
    if (validToken && id && permissions?.access) {
      fetchCustomerData();
    };
  }, [validToken, id, permissions]);

  const exportClientDetailAsPdf = () => {
    const element = document.querySelector("#exportClientDetail");
    const options = {
      filename: `${customer?.name}.pdf`,
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
    return <p className="text-center mt-5">Loading client details...</p>;
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
          <h4>Client Detail</h4>
          <Link to="#" onClick={exportClientDetailAsPdf}><button className="btn btn-secondary">Download</button></Link>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="card rounded-3" id="exportClientDetail">
          <div className="card-header bg-secondary text-white text-center">
            <i className="bi bi-person-circle fs-1"></i>
            <h4 className="text-white mt-2">Client Details</h4>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <DetailItem label="Name" value={customer?.name} />
              <DetailItem label="Email" value={customer?.email} />
              <DetailItem label="Mobile" value={customer?.mobile} />
              <DetailItem label="Password" value={customer?.password} />
              <DetailItem label="GST Number" value={customer?.GSTNumber} />
              <DetailItem label="Company Name" value={customer?.companyName} />
              <DetailItem label="State" value={customer?.state} />
              <DetailItem label="Address" value={customer?.address} />
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

export default CustomerDetail;
