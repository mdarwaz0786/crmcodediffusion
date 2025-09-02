/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { useEffect, useState } from "react";
import axios from 'axios';
import { useAuth } from "../../context/authContext.jsx";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Preloader from "../../Preloader.jsx";
import html2pdf from "html2pdf.js";
import formatDate from "../../Helper/formatDate.js";
const base_url = import.meta.env.VITE_API_BASE_URL;

const SingleProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState("");
  const [totalReceived, setTotalReceived] = useState("");
  const [projectWork, setProjectWork] = useState([]);
  const { team, validToken, isLoading } = useAuth();
  const permissions = team?.role?.permissions?.project;
  const fieldPermissions = team?.role?.permissions?.project?.fields;

  const fetchSingleProject = async (id) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/project/single-project/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setData(response?.data?.project);
      };
    } catch (error) {
      console.log("Error while fetching single project:", error.message);
    };
  };

  const fetchProjectWork = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/projectWork/byEmployee`, {
        params: {
          projectId: id,
        },
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setProjectWork(response?.data?.data);
      };
    } catch (error) {
      console.log("Error while fetching project work:", error.message);
    };
  };

  const fetchInvoiceDetails = async (id) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/invoice/byProject/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setTotalReceived(response?.data?.totalReceived);
      };
    } catch (error) {
      if (error?.response?.data?.success === false) {
        setTotalReceived("");
      };
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.access && id) {
      fetchSingleProject(id);
      fetchProjectWork();
      fetchInvoiceDetails(id);
    };
  }, [isLoading, team, permissions, id]);

  const exportProjectDetailAsPdf = () => {
    const element = document.querySelector("#exportProjectDetail");
    const options = {
      filename: `${data?.projectId}-${data?.projectName}.pdf`,
      margin: [10, 10, 10, 10],
      html2canvas: {
        useCORS: true,
        scale: 4,
      },
      jsPDF: {
        orientation: 'portrait',
        unit: 'pt',
        format: 'a3',
      },
    };
    if (element) {
      html2pdf().set(options).from(element).save();
    };
  };

  const convertToHoursAndMinutes = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} hour${h !== 1 ? 's' : ''} ${m} minute${m !== 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (!permissions?.access) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content" id="exportProjectDetail">
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
            <h4>Project Detail</h4>
            {
              (permissions?.export) && (
                <Link to="#" onClick={exportProjectDetailAsPdf}><button className="btn btn-secondary">Download</button></Link>
              )
            }
            <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
          </div>
          <div className="row">
            <div className="col-md-6 mb-0">
              {
                (fieldPermissions?.projectName?.show) && (
                  <p className="mb-2"><strong>Project Name:</strong> {data?.projectName}</p>
                )
              }
              {
                (fieldPermissions?.projectId?.show) && (
                  <p className="mb-2"><strong>Project ID:</strong> {data?.projectId}</p>
                )
              }
              {
                (fieldPermissions?.customer?.show) && (
                  <p className="mb-2"><strong>Client Name:</strong> {data?.customer?.name}</p>
                )
              }
            </div>
            <div className="col-md-6 mb-0">
              {
                (fieldPermissions?.projectType?.show) && (
                  <p className="mb-2"><strong>Project Type:</strong> {data?.projectType?.name}</p>
                )
              }
              {
                (fieldPermissions?.projectCategory?.show) && (
                  <p className="mb-2"><strong>Project Category:</strong> {data?.projectCategory?.name}</p>
                )
              }
              {
                (fieldPermissions?.technology?.show) && (
                  <p className="mb-0"><strong>Technology Used:</strong> {data?.technology?.map((t) => t?.name).join(', ')}</p>
                )
              }
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-0">
              {
                (fieldPermissions?.totalHour?.show) && (
                  <p className="mb-2"><strong>Total Hour:</strong> {convertToHoursAndMinutes(data?.totalHour)}</p>
                )
              }
              {
                (fieldPermissions?.projectPrice?.show) && (
                  <p className="mb-2"><strong>Project Cost:</strong> ₹{data?.projectPrice}</p>
                )
              }
              {
                (fieldPermissions?.projectPrice?.show) && (
                  <p className="mb-2"><strong>Total Received:</strong> ₹{totalReceived || 0}</p>
                )
              }
              {
                (fieldPermissions?.projectPrice?.show) && (
                  <p className="mb-2"><strong>Total Dues:</strong> ₹{parseFloat(data?.projectPrice) - (parseFloat(totalReceived) || 0)}</p>
                )
              }
              {
                (fieldPermissions?.projectDeadline?.show) && (
                  <p className="mb-2"><strong>Project Deadline:</strong> {(formatDate(data?.projectDeadline))}</p>
                )
              }
            </div>
            <div className="col-md-6 mb-0">
              {
                (fieldPermissions?.projectPriority?.show) && (
                  <p className="mb-2"><strong>Project Priority:</strong> {data?.projectPriority?.name}</p>
                )
              }
              {
                (fieldPermissions?.responsiblePerson?.show) && (
                  <p className="mb-2"><strong>Responsible Person:</strong> {data?.responsiblePerson?.map((member) => member?.name).join(', ')}</p>
                )
              }
              {
                (fieldPermissions?.teamLeader?.show) && (
                  <p className="mb-2"><strong>Team Leader:</strong> {data?.teamLeader?.map((member) => member?.name).join(', ')}</p>
                )
              }
              {
                (fieldPermissions?.projectStatus?.show) && (
                  <p className="mb-2"><strong>Project Status:</strong> {data?.projectStatus?.status}</p>
                )
              }
            </div>
          </div>

          {
            (fieldPermissions?.projectStatus?.show && !fieldPermissions?.projectStatus?.read) && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                <Link to={`/update-project-status/${id}`}><button className="btn btn-primary">Update Status</button></Link>
              </div>
            )
          }

          {
            projectWork?.map((p, index) => (
              <div key={index} className="table-responsive custom-table" style={{ marginBottom: "2rem" }}>
                <h5 style={{ marginBottom: "0.5rem" }}>{p?.employeeName}</h5>
                <table className="table table-bordered table-striped custom-border">
                  <thead className="thead-light">
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      p?.projectWorks?.map((d, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{formatDate(d?.date)}</td>
                          <td>{d?.description}</td>
                          <td>{d?.status}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default SingleProjectDetail;
