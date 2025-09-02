/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/authContext.jsx';
import Preloader from '../../Preloader';
const base_url = import.meta.env.VITE_API_BASE_URL;

const EditOffice = () => {
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
          setImagePreview(office?.logo);
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

  const validateForm = () => {
    for (const field in formData) {
      if (!formData[field]) {
        toast.error(`${field.replace(/([A-Z])/g, ' $1')} is required.`);
        return false;
      };
    };

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid Email format.");
      return false;
    };

    if (!emailRegex.test(formData.noReplyEmail)) {
      toast.error("Invalid No Reply Email format.");
      return false;
    };

    if (!/^[A-Z0-9]{15}$/.test(formData.GSTNumber)) {
      toast.error('Invalid GST Number. It should be 15 characters long and contain only uppercase letters and numbers.');
      return false;
    };

    if (!/^[0-9]{10}$/.test(formData.contact)) {
      toast.error('Invalid contact number. It should be a 10-digit number.');
      return false;
    };

    if (!/^[0-9]{9,18}$/.test(formData.accountNumber)) {
      toast.error('Invalid account number. It should be between 9 to 18 digits.');
      return false;
    };

    if (!/^https?:\/\//.test(formData.websiteLink)) {
      toast.error('Invalid website link. It should start with http:// or https://');
      return false;
    };

    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file.");
        return;
      };

      if (file.size > 1 * 1024 * 1024) {
        toast.error("Image size should be less than 1MB.");
        return;
      };

      setFormData((prevState) => ({ ...prevState, logo: file }));
      setImagePreview(URL.createObjectURL(file));
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e, id) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    };

    try {
      const response = await axios.put(`${base_url}/api/v1/officeLocation/update-officeLocation/${id}`, formData, {
        headers: {
          Authorization: validToken,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response?.data?.success) {
        setFormData({
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
        setImagePreview(null);
        toast.success("Updated successfully");
        navigate(-1);
      };
    } catch (error) {
      toast.error(error?.response?.data?.message);
    };
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (!team?.role?.permissions?.office?.update) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Update Office</h4>
          <Link to="#" onClick={() => navigate(-1)}>
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
              <label className="col-form-label" htmlFor="email">Email ID <span className="text-danger">*</span></label>
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
              <label className="col-form-label" htmlFor="contact">Contact Number <span className="text-danger">*</span></label>
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
              <label className="col-form-label" htmlFor="noReplyEmail">No Reply Email <span className="text-danger">*</span></label>
              <input
                type="email"
                name="noReplyEmail"
                id="noReplyEmail"
                className="form-control"
                value={formData.noReplyEmail}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="noReplyEmailAppPassword">No Reply Email App Password <span className="text-danger">*</span></label>
              <input
                type="text"
                name="noReplyEmailAppPassword"
                id="noReplyEmailAppPassword"
                className="form-control"
                value={formData.noReplyEmailAppPassword}
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
              <label className="col-form-label" htmlFor="logo">Company Logo (Max 1MB) <span className="text-danger">*</span></label>
              <input
                type="file"
                name="logo"
                id="logo"
                accept="image/*"
                className="form-control"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {imagePreview && (
            <div className="text-center mt-1 mb-1">
              <img src={imagePreview} alt="Preview" style={{ maxWidth: "100px", height: "auto", objectFit: "contain" }} />
            </div>
          )}

          <h5 className="text-center mt-5 mb-4">Bank Detail</h5>

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

          <h5 className="text-center mt-5 mb-4">Location Detail</h5>

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
          <Link to="#" style={{ marginRight: "1rem" }} onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={(e) => handleSubmit(e, id)}>Submit</Link>
        </div>
      </div>
    </div>
  );
};

export default EditOffice;
