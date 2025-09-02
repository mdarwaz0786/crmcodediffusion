/* eslint-disable no-extra-semi */
import { useState } from "react";
import axios from "axios";
const base_url = import.meta.env.VITE_API_BASE_URL;

const AddPlan = () => {
  const [formData, setFormData] = useState({
    planName: "",
    isPaid: false,
    planDetail: [
      { mrp: "", discount: "", detail: "" }
    ]
  });

  // Handle main fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Handle planDetail fields
  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDetails = [...formData.planDetail];
    updatedDetails[index][name] = value;
    setFormData((prev) => ({
      ...prev,
      planDetail: updatedDetails
    }));
  };

  // Add new detail row
  const addDetail = () => {
    setFormData((prev) => ({
      ...prev,
      planDetail: [...prev.planDetail, { mrp: "", discount: "", detail: "" }]
    }));
  };

  // Remove detail row
  const removeDetail = (index) => {
    const updatedDetails = formData.planDetail.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      planDetail: updatedDetails
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${base_url}/api/v1/plan/create-plan`, formData); // change URL to your backend route
      alert("Plan created successfully!");
    } catch (error) {
      console.error(error);
      alert("Error creating plan");
    };
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div className="container mt-4">
          <h3>Create Plan</h3>
          <form onSubmit={handleSubmit} className="p-3 border rounded">

            {/* Plan Name */}
            <div className="mb-3">
              <label className="form-label">Plan Name</label>
              <input
                type="text"
                name="planName"
                value={formData.planName}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            {/* Is Paid */}
            <div className="form-check mb-3">
              <input
                type="checkbox"
                name="isPaid"
                checked={formData.isPaid}
                onChange={handleChange}
                className="form-check-input"
                id="isPaid"
              />
              <label htmlFor="isPaid" className="form-check-label">
                Is Paid
              </label>
            </div>

            {/* Plan Details */}
            <h5 style={{ marginBottom: "2rem", textAlign: "center" }}>Plan Details</h5>
            {formData.planDetail.map((detail, index) => (
              <div key={index} className="row mb-3 g-2 align-items-end">
                <div className="col-md-3">
                  <label className="form-label">MRP</label>
                  <input
                    type="number"
                    name="mrp"
                    value={detail.mrp}
                    onChange={(e) => handleDetailChange(index, e)}
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={detail.discount}
                    onChange={(e) => handleDetailChange(index, e)}
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Detail</label>
                  <input
                    type="text"
                    name="detail"
                    value={detail.detail}
                    onChange={(e) => handleDetailChange(index, e)}
                    className="form-control"
                  />
                </div>
                <div className="col-md-2 d-flex gap-2">
                  {index === formData.planDetail.length - 1 && (
                    <button type="button" onClick={addDetail} className="btn btn-success">
                      +
                    </button>
                  )}
                  {formData.planDetail.length > 1 && (
                    <button type="button" onClick={() => removeDetail(index)} className="btn btn-danger">
                      -
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Submit */}
            <button type="submit" className="btn btn-primary mt-3">
              Save Plan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPlan;
