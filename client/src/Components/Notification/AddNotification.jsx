/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext.jsx";
import { toast } from "react-toastify";
const base_url = import.meta.env.VITE_API_BASE_URL;

const AddNotification = () => {
  const { validToken, isLoading, team } = useAuth();
  const [teamMember, setTeamMember] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState([]);
  const [message, setMessage] = useState("");
  const [toAll, setToAll] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSelectChangeEmployee = (e) => {
    const value = e.target.value;
    if (value && !selectedEmployee?.includes(value)) {
      setSelectedEmployee([...selectedEmployee, value]);
    };
  };

  const handleRemoveEmployee = (value) => {
    setSelectedEmployee(selectedEmployee?.filter((item) => item !== value));
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/team/all-team`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setTeamMember(response.data.team);
      };

    } catch (error) {
      console.error("Error while fetching employees:", error);
    };
  };

  useEffect(() => {
    if (!isLoading && team) {
      fetchEmployees();
    };
  }, [isLoading, team]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message) {
      toast.error("Message is required");
      return;
    };

    setLoading(true);

    const notificationData = {
      employee: selectedEmployee,
      date: new Date().toISOString().split("T")[0],
      sendBy: team?._id,
      message,
      toAll,
    };

    try {
      const response = await axios.post(`${base_url}/api/v1/notification/create-notification`, notificationData, {
        headers: {
          Authorization: validToken,
        },
      });
      if (response?.data?.success) {
        toast.success("Send Successfully");
        setSelectedEmployee([]);
        setMessage("");
        setToAll(false);
      };
    } catch (error) {
      console.log(error.message);
      toast.error(error?.response?.data?.message || "Failed to send notification");
    } finally {
      setLoading(false);
    };
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div className="container">
          <h4 style={{ marginBottom: "1rem" }}>Send Notification</h4>
          <form onSubmit={handleSubmit} className="form">
            <div className="row">
              <div className="col-md-12">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="teamLeader">Employee</label>
                  <select className="form-select" name="TeamLeader" id="teamLeader" value="" onChange={handleSelectChangeEmployee}>
                    <option value="" style={{ color: "rgb(120, 120, 120)" }}>Select</option>
                    {
                      teamMember?.filter((t) => !selectedEmployee.includes(t?._id)).map((t) => (
                        <option key={t?._id} value={t?._id}>{t?.name}</option>
                      ))
                    }
                  </select>
                  <div className="selected-container">
                    {
                      selectedEmployee?.map((leader, index) => (
                        <span key={index} className="selected-item">
                          {teamMember?.find((t) => t?._id === leader)?.name}
                          <button type="button" className="remove-btn" onClick={() => handleRemoveEmployee(leader)}>{"x"}</button>
                        </span>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="message">Message <span className="text-danger">*</span></label>
                  <textarea type="text" rows={5} className="form-control" name="message" id="message" value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="row" style={{ marginBottom: "1rem" }}>
              <div className="col-md-12">
                <div className="form-check">
                  <label>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={toAll}
                      onChange={() => setToAll(!toAll)}
                    />
                    Send to All Employees
                  </label>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNotification;
