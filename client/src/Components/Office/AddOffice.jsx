/* eslint-disable no-extra-semi */
import { useState } from 'react';
import axios from 'axios';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
const base_url = import.meta.env.VITE_API_BASE_URL;

const AddOffice = () => {
  const [formData, setFormData] = useState({
    uniqueCode: '',
    name: '',
    websiteLink: '',
    logo: '',
    email: '',
    contact: '',
    GSTNumber: '',
    accountNumber: '',
    accountName: '',
    accountType: '',
    bankName: '',
    IFSCCode: '',
    latitude: '',
    longitude: '',
    attendanceRadius: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${base_url}/api/v1/officeLocation/create-officeLocation`, formData);
      if (response?.data?.success) {
        setFormData({
          uniqueCode: '',
          name: '',
          websiteLink: '',
          logo: '',
          email: '',
          contact: '',
          GSTNumber: '',
          accountNumber: '',
          accountName: '',
          accountType: '',
          bankName: '',
          IFSCCode: '',
          latitude: '',
          longitude: '',
          attendanceRadius: '',
          addressLine1: '',
          addressLine2: '',
          addressLine3: '',
        });
        toast.success("Submitted successfully");
        Navigate(-1);
      };
    } catch (error) {
      console.log('Error:', error?.response?.data?.message || "Try Again");
      toast.error(error?.response?.data?.message || "Try Again");
    };
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Add Office</h4>
          <Link to="#" onClick={() => Navigate(-1)}>
            <button className="btn btn-primary">Back</button>
          </Link>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="uniqueCode">Unique Code <span className="text-danger">*</span></label>
              <input
                type="text"
                name="uniqueCode"
                id="uniqueCode"
                className="form-control"
                value={formData.uniqueCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="name">Company Name <span className="text-danger">*</span></label>
              <input
                type="text"
                name="name"
                id="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="logo">Logo <span className="text-danger">*</span></label>
              <input
                type="text"
                name="logo"
                id="logo"
                className="form-control"
                value={formData.logo}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="websiteLink">Website Link <span className="text-danger">*</span></label>
              <input
                type="text"
                name="websiteLink"
                id="websiteLink"
                className="form-control"
                value={formData.websiteLink}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="email">Email <span className="text-danger">*</span></label>
              <input
                type="email"
                name="email"
                id="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="contact">Contact <span className="text-danger">*</span></label>
              <input
                type="text"
                name="contact"
                id="contact"
                className="form-control"
                value={formData.contact}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="GSTNumber">GST Number <span className="text-danger">*</span></label>
              <input
                type="text"
                name="GSTNumber"
                id="GSTNumber"
                className="form-control"
                value={formData.GSTNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="accountNumber">Account Number <span className="text-danger">*</span></label>
              <input
                type="text"
                name="accountNumber"
                id="accountNumber"
                className="form-control"
                value={formData.accountNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="accountName">Account Name <span className="text-danger">*</span></label>
              <input
                type="text"
                name="accountName"
                id="accountName"
                className="form-control"
                value={formData.accountName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="accountType">Account Type <span className="text-danger">*</span></label>
              <input
                type="text"
                name="accountType"
                id="accountType"
                className="form-control"
                value={formData.accountType}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="bankName">Bank Name <span className="text-danger">*</span></label>
              <input
                type="text"
                name="bankName"
                id="bankName"
                className="form-control"
                value={formData.bankName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="IFSCCode">IFSC Code <span className="text-danger">*</span></label>
              <input
                type="text"
                name="IFSCCode"
                id="IFSCCode"
                className="form-control"
                value={formData.IFSCCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="latitude">Latitude <span className="text-danger">*</span></label>
              <input
                type="text"
                name="latitude"
                id="latitude"
                className="form-control"
                value={formData.latitude}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="longitude">Longitude <span className="text-danger">*</span></label>
              <input
                type="text"
                name="longitude"
                id="longitude"
                className="form-control"
                value={formData.longitude}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="attendanceRadius">Attendance Radius <span className="text-danger">*</span></label>
              <input
                type="text"
                name="attendanceRadius"
                id="attendanceRadius"
                className="form-control"
                value={formData.attendanceRadius}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="addressLine1">Address Line 1 <span className="text-danger">*</span></label>
              <input
                type="text"
                name="addressLine1"
                id="addressLine1"
                className="form-control"
                value={formData.addressLine1}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="addressLine2">Address Line 2 <span className="text-danger">*</span></label>
              <input
                type="text"
                name="addressLine2"
                id="addressLine2"
                className="form-control"
                value={formData.addressLine2}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="addressLine3">Address Line 3 <span className="text-danger">*</span></label>
              <input
                type="text"
                name="addressLine3"
                id="addressLine3"
                className="form-control"
                value={formData.addressLine3}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="text-end">
          <Link to="#" style={{ marginRight: "1rem" }} onClick={() => Navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={handleSubmit}>Submit</Link>
        </div>
      </div>
    </div>
  );
};

export default AddOffice;
