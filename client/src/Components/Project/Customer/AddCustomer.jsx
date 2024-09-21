/* eslint-disable no-extra-semi */
import { useState } from "react";
import axios from 'axios';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from "../../../context/authContext.jsx";
import Preloader from "../../../Preloader.jsx";

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

const formFields = [
  { name: 'name', type: 'text', label: 'Client Name' },
  { name: 'email', type: 'email', label: 'Email ID' },
  { name: 'mobile', type: 'text', label: 'Mobile No.' },
  { name: 'GSTNumber', type: 'text', label: 'GST Number' },
  { name: 'companyName', type: 'text', label: 'Company Name' },
  { name: 'state', type: 'select', label: 'State' },
  { name: 'address', type: 'textarea', label: 'Address', row: 4 },
];

const AddCustomer = () => {
  const [formData, setFormData] = useState(formFields.reduce((accumulator, field) => ({ ...accumulator, [field.name]: "" }), {}));
  const [selectedState, setSelectedState] = useState(null);
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();
  const permissions = team?.role?.permissions?.customer;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStateChange = (selectedOption) => {
    setSelectedState(selectedOption);
    setFormData((prev) => ({ ...prev, state: selectedOption ? selectedOption.value : "" }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();


    // Validation
    const requiredFields = formFields.filter(({ name }) => name !== 'GSTNumber' && name !== 'companyName');
    const allFieldsValid = requiredFields.every(({ name }) => formData[name]) && selectedState;

    if (!allFieldsValid) {
      return toast.error("All required fields must be filled.");
    };

    try {
      const response = await axios.post("/api/v1/customer/create-customer", formData, {
        headers: { Authorization: `${validToken}` },
      });

      if (response?.data?.success) {
        setFormData((prev) => Object.keys(prev).reduce((accumulator, key) => ({ ...accumulator, [key]: "" }), {}));
        setSelectedState(null);
        toast.success("Submitted Successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while creating customer:", error.message);
      toast.error("Error while creating");
    };
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (!permissions?.create) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "1rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Add Client</h4>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <form onSubmit={handleCreate}>
          <div className="row">
            {
              formFields.map(({ name, type, label, row }) => {
                if (name === 'state') {
                  return (
                    <div className="col-md-6" key={name}>
                      <div className="form-wrap">
                        <label className="col-form-label" htmlFor="state">
                          {label} {(name === 'state') && <span className="text-danger">*</span>}
                        </label>
                        <Select
                          styles={{
                            control: (provided) => ({ ...provided, outline: 'none', border: "none", boxShadow: 'none' }),
                            indicatorSeparator: (provided) => ({ ...provided, display: 'none' }),
                            option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? "#f0f0f0" : state.isFocused ? "#e0e0e0" : "#fff", color: "#333" }),
                          }}
                          className="form-select p-0"
                          id="state"
                          name="state"
                          value={selectedState}
                          onChange={handleStateChange}
                          options={statesOfIndia} />
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className={type === "textarea" ? "col-md-12" : "col-md-6"} key={name}>
                      <div className="form-wrap">
                        <label className="col-form-label" htmlFor={name}>
                          {label} {(name === 'name' || name === 'email' || name === 'mobile' || name === 'address') && <span className="text-danger">*</span>}
                        </label>
                        {type === "textarea" ? (
                          <textarea className="form-control" rows={row} name={name} id={name} value={formData[name]} onChange={handleChange} />
                        ) : (
                          <input type={type} className="form-control" name={name} id={name} value={formData[name]} onChange={handleChange} />
                        )}
                      </div>
                    </div>
                  );
                }
              })
            }
          </div>
          <div className="submit-button text-end">
            <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
            <button type="submit" className="btn btn-primary">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;