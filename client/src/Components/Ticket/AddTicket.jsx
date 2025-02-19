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
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();
  const permissions = team?.role?.permissions?.ticket;

  const fetchAllProject = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/project/all-project`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setProject(response?.data?.project);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (permissions?.create) {
      fetchAllProject();
    };
  }, [permissions]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {

      // Validations
      if (!title) {
        return toast.error("Enter title");
      };

      if (!description) {
        return toast.error("Enter description");
      };

      if (!selectedProject) {
        return toast.error("Select project");
      };

      if (!priority) {
        return toast.error("Select priority");
      };

      if (!ticketType) {
        return toast.error("Select ticket type");
      };

      const response = await axios.post(`${base_url}/api/v1/ticket/create-ticket`,
        { title, description, projectId: selectedProject, priority, ticketType },
        {
          headers: {
            Authorization: validToken,
          },
        });

      if (response?.data?.success) {
        setTitle("");
        setDescription("");
        setSelectedProject("");
        setPriority("");
        toast.success("Submitted Successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while creating designation:", error.message);
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
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="title">Title <span className="text-danger">*</span></label>
              <input type="text" className="form-control" name="title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="project">Project <span className="text-danger">*</span></label>
              <select className="form-select" name="project" id="project" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
                <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                {
                  project?.map((p) => (
                    <option key={p?._id} value={p?._id}>{p?.projectName}</option>
                  ))
                }
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="priority">Priority <span className="text-danger">*</span></label>
              <select className="form-select" name="priority" id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="ticketType">Ticket Type <span className="text-danger">*</span></label>
              <select className="form-select" name="ticketType" id="ticketType" value={ticketType} onChange={(e) => setTicketType(e.target.value)}>
                <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
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
              <label className="col-form-label" htmlFor="description">Description <span className="text-danger"></span></label>
              <textarea className="form-control" rows={4} name="description" id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="submit-button text-end">
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={(e) => handleCreate(e)}>Submit</Link>
        </div>
      </div>
    </div>
  );
};

export default AddTicket;