/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';
import Preloader from '../../Preloader';
const base_url = import.meta.env.VITE_API_BASE_URL;

const SingleOffice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    uniqueCode: '',
    name: '',
    websiteLink: '',
    logo: null,
    email: '',
    noReplyEmail: '',
    noReplyEmailAppPassword: '',
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

  const fetchSingleOffice = async (id) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/officeLocation/single-officeLocation/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        const office = response?.data?.officeLocation;
        setFormData((prevData) => ({
          ...prevData,
          uniqueCode: office?.uniqueCode || '',
          name: office?.name || '',
          logo: office?.logo || null,
          websiteLink: office?.websiteLink || '',
          email: office?.email || '',
          noReplyEmail: office?.noReplyEmail || '',
          noReplyEmailAppPassword: office?.noReplyEmailAppPassword || '',
          contact: office?.contact || '',
          GSTNumber: office?.GSTNumber || '',
          accountNumber: office?.accountNumber || '',
          accountName: office?.accountName || '',
          accountType: office.accountType || '',
          bankName: office?.bankName || '',
          IFSCCode: office?.IFSCCode || '',
          latitude: office?.latitude || '',
          longitude: office?.longitude || '',
          attendanceRadius: office?.attendanceRadius || '',
          addressLine1: office?.addressLine1 || '',
          addressLine2: office?.addressLine2 || '',
          addressLine3: office?.addressLine3 || '',
        }));

        if (office?.logo) {
          setImagePreview(office.logo);
        };
      };
    } catch (error) {
      console.log(error.message)
    };
  };

  useEffect(() => {
    if (id, validToken) {
      fetchSingleOffice(id)
    };
  }, [id, validToken]);

  if (isLoading) {
    return <Preloader />;
  };

  if (!team?.role?.permissions?.office?.access) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Office Detail</h4>
          <Link to="#" onClick={() => navigate(-1)}>
            <button className="btn btn-primary">Back</button>
          </Link>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="uniqueCode">Unique Code</label>
              <input
                type="text"
                name="uniqueCode"
                id="uniqueCode"
                className="form-control"
                value={formData.uniqueCode}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="name">Company Name</label>
              <input
                type="text"
                name="name"
                id="name"
                className="form-control"
                value={formData.name}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="email">Email ID</label>
              <input
                type="email"
                name="email"
                id="email"
                className="form-control"
                value={formData.email}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="contact">Contact Number</label>
              <input
                type="text"
                name="contact"
                id="contact"
                className="form-control"
                value={formData.contact}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="noReplyEmail">No Reply Email</label>
              <input
                type="email"
                name="noReplyEmail"
                id="noReplyEmail"
                className="form-control"
                value={formData.noReplyEmail}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="noReplyEmailAppPassword">No Reply Email App Password</label>
              <input
                type="text"
                name="noReplyEmailAppPassword"
                id="noReplyEmailAppPassword"
                className="form-control"
                value={formData.noReplyEmailAppPassword}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="websiteLink">Website Link</label>
              <input
                type="text"
                name="websiteLink"
                id="websiteLink"
                className="form-control"
                value={formData.websiteLink}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="logo">Company Logo (Max 1MB)</label>
              <input
                type="file"
                name="logo"
                id="logo"
                accept="image/*"
                className="form-control"
              />
            </div>
          </div>

          {imagePreview && (
            <div className="text-center mt-1 mb-1">
              <img src={imagePreview} alt="Preview" style={{ maxWidth: "100px", height: "auto", objectFit: "contain" }} />
            </div>
          )}

          <h5 className="text-center mt-5 mb-4">Bank Account Detail</h5>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="GSTNumber">GST Number</label>
              <input
                type="text"
                name="GSTNumber"
                id="GSTNumber"
                className="form-control"
                value={formData.GSTNumber}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="accountNumber">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                id="accountNumber"
                className="form-control"
                value={formData.accountNumber}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="accountName">Account Name</label>
              <input
                type="text"
                name="accountName"
                id="accountName"
                className="form-control"
                value={formData.accountName}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="accountType">Account Type</label>
              <input
                type="text"
                name="accountType"
                id="accountType"
                className="form-control"
                value={formData.accountType}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="bankName">Bank Name</label>
              <input
                type="text"
                name="bankName"
                id="bankName"
                className="form-control"
                value={formData.bankName}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="IFSCCode">IFSC Code</label>
              <input
                type="text"
                name="IFSCCode"
                id="IFSCCode"
                className="form-control"
                value={formData.IFSCCode}
              />
            </div>
          </div>

          <h5 className="text-center mt-5 mb-4">Location Detail</h5>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="latitude">Latitude</label>
              <input
                type="text"
                name="latitude"
                id="latitude"
                className="form-control"
                value={formData.latitude}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="longitude">Longitude</label>
              <input
                type="text"
                name="longitude"
                id="longitude"
                className="form-control"
                value={formData.longitude}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="attendanceRadius">Attendance Radius</label>
              <input
                type="text"
                name="attendanceRadius"
                id="attendanceRadius"
                className="form-control"
                value={formData.attendanceRadius}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="addressLine1">Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                id="addressLine1"
                className="form-control"
                value={formData.addressLine1}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="addressLine2">Address Line 2</label>
              <input
                type="text"
                name="addressLine2"
                id="addressLine2"
                className="form-control"
                value={formData.addressLine2}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="addressLine3">Address Line 3</label>
              <input
                type="text"
                name="addressLine3"
                id="addressLine3"
                className="form-control"
                value={formData.addressLine3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleOffice;
