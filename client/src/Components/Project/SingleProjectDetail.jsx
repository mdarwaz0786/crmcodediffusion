/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { useEffect, useState } from "react";
import axios from 'axios';
import { useAuth } from "../../context/authContext.jsx";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Preloader from "../../Preloader.jsx";
import html2pdf from "html2pdf.js";

const SingleProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState("");
  const { team, validToken, isLoading } = useAuth();
  const permissions = team?.role?.permissions?.project;
  const fieldPermissions = team?.role?.permissions?.project?.fields;

  const fetchSingleProject = async (id) => {
    try {
      const response = await axios.get(`/api/v1/project/single-project/${id}`, {
        headers: {
          Authorization: `${validToken}`,
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

  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  };

  const convertToHoursAndMinutes = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} hour${h !== 1 ? 's' : ''} ${m} minute${m !== 1 ? 's' : ''}`;
  };

  const calculateHourDifference = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startDate = new Date(0, 0, 0, startHours, startMinutes);
    const endDate = new Date(0, 0, 0, endHours, endMinutes);
    let differenceInMinutes = (endDate - startDate) / (1000 * 60);

    if (differenceInMinutes < 0) {
      differenceInMinutes += 24 * 60;
    };

    const hours = differenceInMinutes / 60;
    return hours;
  };

  // Group work detail by team member
  const groupByTeamMember = (workDetail) => {
    return workDetail.reduce((accumulator, work) => {
      const teamMemberName = work.teamMember?.name;

      if (!accumulator[teamMemberName]) {
        accumulator[teamMemberName] = {
          workDetails: [],
          totalSpentHours: 0,
        };
      };

      const spentHours = calculateHourDifference(work?.startTime, work?.endTime);
      accumulator[teamMemberName].workDetails.push(work);
      accumulator[teamMemberName].totalSpentHours += spentHours;

      return accumulator;
    }, {});
  };

  const groupedWorkDetail = groupByTeamMember(data?.workDetail || []);

  const exportProjectDetailAsPdf = () => {
    const element = document.querySelector("#exportProjectDetail");
    const options = {
      filename: `${data?.projectId}-${data?.projectName}.pdf`,
      margin: [10, 10, 10, 10],
      html2canvas: {
        useCORS: true,
        scale: 2,
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
    <div className="page-wrapper" style={{ paddingBottom: "1rem" }}>
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
                  <h3 className="card-title mb-4">{data?.projectName}</h3>
                )
              }
              <div className="row">
                <div className="col-md-6 mb-3">
                  {
                    (fieldPermissions?.projectName?.show) && (
                      <p><strong>Project Name:</strong> {data?.projectName}</p>
                    )
                  }
                  {
                    (fieldPermissions?.projectId?.show) && (
                      <p><strong>Project ID:</strong> {data?.projectId}</p>
                    )
                  }
                  {
                    (fieldPermissions?.customer?.show) && (
                      <p><strong>Client Name:</strong> {data?.customer?.name}</p>
                    )
                  }
                </div>
                <div className="col-md-6 mb-3">
                  {
                    (fieldPermissions?.projectType?.show) && (
                      <p><strong>Project Type:</strong> {data?.projectType?.name}</p>
                    )
                  }
                  {
                    (fieldPermissions?.projectCategory?.show) && (
                      <p><strong>Project Category:</strong> {data?.projectCategory?.name}</p>
                    )
                  }
                  {
                    (fieldPermissions?.projectTiming?.show) && (
                      <p><strong>Project Timeline:</strong> {data?.projectTiming?.name}</p>
                    )
                  }
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  {
                    (fieldPermissions?.projectStatus.show) && (
                      <p><strong>Project Status:</strong> {data?.projectStatus?.status}</p>
                    )
                  }
                  {
                    (fieldPermissions?.startDate.show) && (
                      <p><strong>Start Date:</strong> {formatDate(data?.startDate)}</p>
                    )
                  }
                  {
                    (fieldPermissions?.endDate.show) && (
                      <p><strong>End Date:</strong> {formatDate(data?.endDate)}</p>
                    )
                  }
                </div>
                <div className="col-md-6 mb-3">
                  {
                    (fieldPermissions?.projectPriority.show) && (
                      <p><strong>Project Priority:</strong> {data?.projectPriority?.name}</p>
                    )
                  }
                  {
                    (fieldPermissions?.responsiblePerson.show) && (
                      <p><strong>Responsible Person:</strong> {data?.responsiblePerson?.map((member) => member?.name).join(', ')}</p>
                    )
                  }
                  {
                    (fieldPermissions?.teamLeader.show) && (
                      <p><strong>Team Leader:</strong> {data?.teamLeader?.map((member) => member?.name).join(', ')}</p>
                    )
                  }
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  {
                    (fieldPermissions?.totalHour.show) && (
                      <p><strong>Total Hour:</strong> {convertToHoursAndMinutes(data?.totalHour)}</p>
                    )
                  }
                  {
                    (fieldPermissions?.totalSpentHour.show) && (
                      <p><strong>Total Spent Hour:</strong> {convertToHoursAndMinutes(data?.totalSpentHour)}</p>
                    )
                  }
                  {
                    (fieldPermissions?.totalRemainingHour.show) && (
                      <p><strong>Total Remaining Hour:</strong> {convertToHoursAndMinutes(data?.totalRemainingHour)}</p>
                    )
                  }
                </div>
                <div className="col-md-6 mb-3">
                  {
                    (fieldPermissions?.projectPrice.show) && (
                      <p><strong>Project Cost:</strong> ₹{data?.projectPrice}</p>
                    )
                  }
                  {
                    (fieldPermissions?.totalPaid.show) && (
                      <p><strong>Total Received:</strong> ₹{data?.totalPaid}</p>
                    )
                  }
                  {
                    (fieldPermissions?.totalDues.show) && (
                      <p><strong>Total Dues:</strong> ₹{data?.totalDues}</p>
                    )
                  }
                </div>
              </div>
              <div className="row">
                {
                  (fieldPermissions?.technology.show) && (
                    <p><strong>Technology Used:</strong> {data?.technology?.map((t) => t?.name).join(', ')}</p>
                  )
                }
              </div>
            </div>
          </div>
          {/* Payment Detail */}
          {
            (fieldPermissions?.payment.show) && (
              <>
                <h4 style={{ marginTop: "5rem", marginBottom: "1rem", textAlign: "center" }}>Payment History</h4>
                <div style={{ display: "flex", columnGap: "1rem" }}>
                  <div style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}><strong style={{ color: "#6F6F6F" }}>Project Cost: </strong>₹{data?.projectPrice},</div>
                  <div style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}><strong style={{ color: "#6F6F6F" }}>Total Dues: </strong>₹{data?.totalDues}</div>
                </div>
                <div className="table-responsive custom-table">
                  <table className="table table-bordered table-striped custom-border">
                    <thead className="thead-light">
                      <tr>
                        <th>#</th>
                        <th>Received By</th>
                        <th>Payments</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        data?.payment?.map((d, i) => (
                          <tr key={d?._id}>
                            <td>{i + 1}</td>
                            <td>{d?.teamMember?.name}</td>
                            <td>₹{d?.amount}</td>
                            <td>{formatDate(d?.date)}</td>
                          </tr>
                        ))
                      }
                      <tr className="table-secondary">
                        <td colSpan="2"><strong>Total Received</strong></td>
                        <td><strong>₹{data?.totalPaid}</strong></td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )
          }
          {/* /Payment history */}

          {/* Work history */}
          {
            (fieldPermissions?.workDetail.show) && (
              <>
                <h4 style={{ marginTop: "5rem", marginBottom: "1rem", textAlign: "center" }}>Work History</h4>
                {
                  Object.keys(groupedWorkDetail).map((memberName) => (
                    <div key={memberName} className="mb-5">
                      <h5 style={{ color: "#6F6F6F", marginBottom: "0.5rem" }}>{memberName}</h5>
                      <div className="table-responsive custom-table">
                        <table className="table table-bordered table-striped custom-border">
                          <thead className="thead-light">
                            <tr>
                              <th>#</th>
                              <th>Work Description</th>
                              <th>Start Time</th>
                              <th>End Time</th>
                              <th>Spent Hour</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {
                              groupedWorkDetail[memberName].workDetails.map((w, i) => (
                                <tr key={w?._id}>
                                  <td>{i + 1}</td>
                                  <td>{w?.workDescription}</td>
                                  <td>{w?.startTime}</td>
                                  <td>{w?.endTime}</td>
                                  <td>{convertToHoursAndMinutes(calculateHourDifference(w?.startTime, w?.endTime))}</td>
                                  <td>{formatDate(w?.date)}</td>
                                </tr>
                              ))
                            }
                            <tr className="table-secondary">
                              <td colSpan="4"><strong>Total Spent Hours</strong></td>
                              <td colSpan="2"><strong>{convertToHoursAndMinutes(groupedWorkDetail[memberName].totalSpentHours.toFixed(2))}</strong></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                }
              </>
            )
          }
          {/* /Work history */}
        </div>
      </div>
    </div>
  );
};

export default SingleProjectDetail;
