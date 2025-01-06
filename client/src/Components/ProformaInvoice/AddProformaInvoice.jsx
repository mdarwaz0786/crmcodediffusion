/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from "../../Preloader.jsx";
import Select from "react-select";
const base_url = import.meta.env.VITE_API_BASE_URL;

const AddProformaInvoice = () => {
  const [projectName, setProjectName] = useState("");
  const [projectCost, setProjectCost] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tax, setTax] = useState("Exclusive");
  const [clientName, setClientName] = useState("");
  const [GSTNumber, setGSTNumber] = useState("");
  const [shipTo, setShipTo] = useState("");
  const [state, setState] = useState(null);
  const { validToken, team, isLoading } = useAuth();
  const navigate = useNavigate();
  const permissions = team?.role?.permissions?.invoice;

  const statesOfIndia = [
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
    { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
    { value: 'Assam', label: 'Assam' },
    { value: 'Bihar', label: 'Bihar' },
    { value: 'Chhattisgarh', label: 'Chhattisgarh' },
    { value: 'Chhandigarh', label: 'Chhandigarh' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Goa', label: 'Goa' },
    { value: 'Gujarat', label: 'Gujarat' },
    { value: 'Haryana', label: 'Haryana' },
    { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
    { value: 'Jharkhand', label: 'Jharkhand' },
    { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'Kerala', label: 'Kerala' },
    { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Manipur', label: 'Manipur' },
    { value: 'Meghalaya', label: 'Meghalaya' },
    { value: 'Mizoram', label: 'Mizoram' },
    { value: 'Nagaland', label: 'Nagaland' },
    { value: 'Odisha', label: 'Odisha' },
    { value: 'Punjab', label: 'Punjab' },
    { value: 'Rajasthan', label: 'Rajasthan' },
    { value: 'Sikkim', label: 'Sikkim' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    { value: 'Telangana', label: 'Telangana' },
    { value: 'Tripura', label: 'Tripura' },
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
    { value: 'Uttarakhand', label: 'Uttarakhand' },
    { value: 'West Bengal', label: 'West Bengal' },
    { value: 'Puducherry', label: 'Puducherry' },
    { value: 'Daman and Diu', label: 'Daman and Diu' },
    { value: 'Lakshadweep', label: 'Lakshadweep' },
    { value: 'Ladakh', label: 'Ladakh' },
    { value: 'Andaman and Nicobar Islands', label: 'Andaman and Nicobar Islands' },
    { value: 'Dadra and Nagar haveli', label: 'Dadra and Nagar haveli' },
  ];

  const handleStateChange = (selectedOption) => {
    setState(selectedOption.value);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    // Validations
    if (!projectName) {
      return toast.error("Enter project name");
    };

    if (!projectCost) {
      return toast.error("Enter project cost");
    };

    if (!date) {
      return toast.error("Select date");
    };

    if (!tax) {
      return toast.error("Select tax");
    };

    if (!shipTo) {
      return toast.error("Enter ship to");
    };

    if (!clientName) {
      return toast.error("Enter client name");
    };

    if (!state) {
      return toast.error("Enter state");
    };

    if (!GSTNumber) {
      return toast.error("Enter GST Number");
    };

    try {
      const invoiceData = {
        projectName,
        projectCost,
        date,
        tax,
        clientName,
        GSTNumber,
        shipTo,
        state,
      };

      const response = await axios.post(`${base_url}/api/v1/proformaInvoice/create-proformaInvoice`, invoiceData, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        toast.success("Submitted successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while creating invoices:", error.message);
      toast.error("Error while submitting");
    };
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1rem" }}>
          <h4>Add Proforma Invoice</h4>
          <Link to="#" onClick={() => navigate(-1)}>
            <button className="btn btn-primary">Back</button>
          </Link>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="tax">Tax <span className="text-danger">*</span></label>
              <select className="form-select" name="tax" id="tax" value={tax} onChange={(e) => setTax(e.target.value)}>
                <option value="">Select</option>
                <option value="Inclusive">Inclusive</option>
                <option value="Exclusive">Exclusive</option>
              </select>
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="date">Date <span className="text-danger">*</span></label>
              <input type="date" className="form-control" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="clientName">Client Name <span className="text-danger">*</span></label>
              <input type="text" className="form-control" id="clientName" name="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="GSTNumber">GST Number <span className="text-danger">*</span></label>
              <input type="text" className="form-control" id="GSTNumber" name="GSTNumber" value={GSTNumber} onChange={(e) => setGSTNumber(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="shipTo">Ship To <span className="text-danger">*</span></label>
              <input type="text" className="form-control" id="shipTo" name="shipTo" value={shipTo} onChange={(e) => setShipTo(e.target.value)} />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="state">State <span className="text-danger">*</span></label>
              <Select
                styles={{
                  control: (provided) => ({ ...provided, outline: 'none', border: "none", boxShadow: 'none' }),
                  indicatorSeparator: (provided) => ({ ...provided, display: 'none' }),
                  option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? "#f0f0f0" : state.isFocused ? "#e0e0e0" : "#fff", color: "#333" }),
                }}
                className="form-select p-0"
                id="state"
                name="state"
                value={statesOfIndia.find((option) => option.value === state)}
                onChange={handleStateChange}
                options={statesOfIndia}
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="projectName">Project Name <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                name="projectName"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="projectCost">Project Cost <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                name="projectCost"
                id="projectCost"
                value={projectCost}
                onChange={(e) => setProjectCost(e.target.value)}
              />
              {
                (parseFloat(projectCost) < 1) && (
                  <div className="col-form-label" style={{ color: "red" }}>Project cost should not less than 1. <i className="fas fa-times"></i></div>
                )
              }
            </div>
          </div>
        </div>

        <div className="submit-button text-end">
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link className="btn btn-primary" onClick={handleCreate}>Submit</Link>
        </div>
      </div>
    </div>
  );
};

export default AddProformaInvoice;
