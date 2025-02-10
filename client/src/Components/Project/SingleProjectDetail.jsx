/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { useEffect, useState } from "react";
import axios from 'axios';
import { useAuth } from "../../context/authContext.jsx";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Preloader from "../../Preloader.jsx";
import html2pdf from "html2pdf.js";
const base_url = import.meta.env.VITE_API_BASE_URL;

const SingleProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState("");
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

  useEffect(() => {
    if (!isLoading && team && permissions?.access && id) {
      fetchSingleProject(id);
    }
  }, [isLoading, team, permissions, id]);

  const convertToHoursAndMinutes = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} hour${h !== 1 ? 's' : ''} ${m} minute${m !== 1 ? 's' : ''}`;
  };

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
              permissions?.export && (
                <Link to="#" onClick={exportProjectDetailAsPdf}><button className="btn btn-secondary">Download</button></Link>
              )
            }
            <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
          </div>
          <div>
            <div>
              {
                (fieldPermissions?.projectName?.show) && (
                  <h4 className="card-title mb-3">{data?.projectName}</h4>
                )
              }
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
                    (fieldPermissions?.projectStatus?.show) && (
                      <p className="mb-2"><strong>Project Status:</strong> {data?.projectStatus?.status}</p>
                    )
                  }
                  {
                    (fieldPermissions?.totalHour?.show) && (
                      <p className="mb-2"><strong>Total Hour:</strong> {convertToHoursAndMinutes(data?.totalHour)}</p>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProjectDetail;
