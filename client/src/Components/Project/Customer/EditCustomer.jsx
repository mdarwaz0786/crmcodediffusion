/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Select from 'react-select';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../../context/authContext.jsx";
import Preloader from "../../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const statesOfIndia = [
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
  { value: 'Assam', label: 'Assam' },
  { value: 'Bihar', label: 'Bihar' },
  { value: 'Chhattisgarh', label: 'Chhattisgarh' },
  { value: 'Chhandigarh', label: 'Chhandigarh' },
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
  { name: 'role', type: 'select', label: 'Role' },
  { name: 'password', type: 'text', label: 'Password' },
];

const EditCustomer = () => {
  const [formData, setFormData] = useState(formFields.reduce((accumulator, field) => ({ ...accumulator, [field.name]: "" }), {}));
  const [selectedState, setSelectedState] = useState(null);
  const [fieldPermissions, setFieldPermissions] = useState({});
  const [role, setRole] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();
  const permissions = team?.role?.permissions?.customer;

  useEffect(() => {
    if (!isLoading && team && permissions?.update && id) {
      fetchSingleData(id);
      setFieldPermissions(permissions?.fields || {});
    };
  }, [id, isLoading, team, permissions]);

  const fetchSingleData = async (id) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/customer/single-customer/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setFormData(response.data.customer);
        setSelectedState(statesOfIndia.find((state) => state.value === response.data.customer.state) || null);
        setSelectedRole(response?.data?.customer?.role?._id);
      };
    } catch (error) {
      console.log("Error while fetching single customer:", error.message);
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
      }
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (validToken && team && !isLoading && permissions?.update && id) {
      fetchAllRole();
    };
  }, [validToken, team, isLoading, permissions, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (!fieldPermissions[name]?.read) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  };

  const handleStateChange = (selectedOption) => {
    setSelectedState(selectedOption);
    setFormData((prev) => ({ ...prev, state: selectedOption ? selectedOption.value : "" }));
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setFormData((prev) => ({ ...prev, role: e.target.value }));
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();

    const updateData = Object.fromEntries(Object.entries(formData).filter(([key]) => fieldPermissions[key]?.show && !fieldPermissions[key]?.read));

    try {
      const response = await axios.put(`${base_url}/api/v1/customer/update-customer/${id}`, updateData, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        toast.success("Submitted successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while updating customer:", error.message);
      toast.error("Error while submitting");
    };
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
          <h4>Edit Client</h4>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <form onSubmit={(e) => handleUpdate(e, id)}>
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
                          options={statesOfIndia}
                        />
                      </div>
                    </div>
                  );
                } else if (name === 'role') {
                  return (
                    <div className="col-md-6" key={name}>
                      <div className="form-wrap">
                        <label className="col-form-label" htmlFor="role">
                          {label} <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          name="role"
                          value={selectedRole}
                          onChange={handleRoleChange}
                        >
                          <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                          {role?.map((r) => (
                            <option key={r?._id} value={r?._id}>{r?.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className={type === "textarea" ? "col-md-12" : "col-md-6"} key={name}>
                      <div className="form-wrap">
                        <label className="col-form-label" htmlFor={name}>
                          {label} {(name === 'name' || name === 'email' || name === 'mobile' || name === 'address' || name === 'password') && <span className="text-danger">*</span>}
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

export default EditCustomer;
