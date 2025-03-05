/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from '../../Preloader.jsx';
const base_url = import.meta.env.VITE_API_BASE_URL;

const AddTicket = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [ticketType, setTicketType] = useState("");
  const [project, setProject] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();
  const permissions = team?.role?.permissions?.ticket;

  const fetchAllProject = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/project/all-project`, {
        headers: { Authorization: validToken },
      });
      if (response?.data?.success) setProject(response?.data?.project);
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (permissions?.create) {
      fetchAllProject();
    };
  }, [permissions]);

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

      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    };
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!title || !description || !selectedProject || !priority || !ticketType) {
        return toast.error("Please fill all required fields.");
      };

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("projectId", selectedProject);
      formData.append("priority", priority);
      formData.append("ticketType", ticketType);
      if (image) {
        formData.append("image", image);
      };

      const response = await axios.post(`${base_url}/api/v1/ticket/create-ticket`, formData, {
        headers: {
          Authorization: validToken,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response?.data?.success) {
        setTitle(""); setDescription(""); setSelectedProject(""); setPriority(""); setImage(null);
        toast.success("Submitted Successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while creating ticket:", error.message);
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
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Raise Ticket</h4>
          <Link to="#" onClick={() => navigate(-1)}>
            <button className="btn btn-primary">Back</button>
          </Link>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label">Ticket Title <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label">Project Name <span className="text-danger">*</span></label>
              <select className="form-select" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
                <option value="">Select</option>
                {project?.map((p) => (<option key={p?._id} value={p?._id}>{p?.projectName}</option>))}
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label">Ticket Priority <span className="text-danger">*</span></label>
              <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="">Select</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label">Ticket Type <span className="text-danger">*</span></label>
              <select className="form-select" value={ticketType} onChange={(e) => setTicketType(e.target.value)}>
                <option value="">Select</option>
                <option value="Bug">Bug</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Improvement">Improvement</option>
                <option value="Task">Task</option>
                <option value="Support">Support</option>
                <option value="Incident">Incident</option>
              </select>
            </div>
          </div>
          <div className="col-md-12">
            <div className="form-wrap">
              <label className="col-form-label">Description <span className="text-danger">*</span></label>
              <textarea className="form-control" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <div className="col-md-12">
            <div className="form-wrap">
              <label className="col-form-label">Upload Image (Max 1MB)</label>
              <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <div className="mt-3 text-center">
                  <p><strong>Image Preview:</strong></p>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: "100%", height: "auto" }} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="submit-button text-end">
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light">Cancel</Link>
          <button className="btn btn-primary" onClick={handleCreate}>Submit</button>
        </div>
      </div>
    </div>
  );
};

export default AddTicket;