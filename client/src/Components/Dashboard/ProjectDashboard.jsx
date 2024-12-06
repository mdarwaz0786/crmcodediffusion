/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import axios from 'axios';
import { useAuth } from "../../context/authContext.jsx";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Search from "../Header/Search.jsx";
import Preloader from "../../Preloader.jsx";
import formatTimeWithAmPm from "../../Helper/formatTimeWithAmPm.js";
import formatTimeToHoursMinutes from "../../Helper/formatTimeToHoursMinutes.js";
import formatDate from "../../Helper/formatDate.js";
const base_url = import.meta.env.VITE_API_BASE_URL;

// Register required components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const ProjectDashboard = () => {
  const location = useLocation();
  const [attendance, setAttendance] = useState([]);
  const [projectDeployment, setProjectDeployment] = useState([]);
  const [project, setProject] = useState([]);
  const [projectStatus, setProjectStatus] = useState({});
  const [projectPriority, setProjectPriority] = useState({});
  const [total, setTotal] = useState("");
  const [filteredTotal, setFilteredTotal] = useState("");
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { validToken, team, isLoading } = useAuth();
  const permissions = team?.role?.permissions?.project;
  const fieldPermissions = team?.role?.permissions?.project?.fields;
  const [filters, setFilters] = useState({
    search: "",
    sort: "Descending",
    page: 1,
    limit: 10,
    dateRange: "",
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters]);

  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    const timer = useRef();

    useEffect(() => {
      if (value === "") {
        setDebouncedValue("");
        return;
      };

      timer.current = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(timer.current);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedSearch = useDebounce(filters.search, 500);

  useEffect(() => {
    const { query } = location.state || {};
    if (query !== undefined) {
      setFilters((prevFilters) => ({ ...prevFilters, search: query || "", page: 1 }));
    };
  }, [location.state]);

  const fetchAllProject = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/v1/project/all-project`, {
        headers: {
          Authorization: validToken,
        },
        params: {
          search: filters.search,
          sort: filters.sort,
          page: filters.page,
          limit: filters.limit,
          dateRange: filters.dateRange,
        },
      });

      if (response?.data?.success) {
        const filteredProject = response?.data?.project?.filter((p) => {
          const isLeader = p?.teamLeader?.some((l) => l?._id === team?._id);
          const isResponsible = p?.responsiblePerson?.some((r) => r?._id === team?._id);
          return isLeader || isResponsible;
        });

        if (team?.role?.name.toLowerCase() === "coordinator" || team?.role?.name.toLowerCase() === "admin") {
          setProject(response?.data?.project);
          setTotal(response?.data?.totalCount);
          setFilteredTotal(response?.data?.totalCount);
        } else {
          setProject(filteredProject);
          setTotal(response?.data?.totalCount);
          setFilteredTotal(filteredProject?.length);
        };
        setLoading(false);
      };
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.access) {
      fetchAllProject();
    };
  }, [debouncedSearch, filters.limit, filters.page, filters.sort, filters.dateRange, isLoading, team, permissions]);

  const fetchAllProjectForDashboard = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/project/all-project`, {
        headers: {
          Authorization: validToken,
        },
        params: {
          dateRange: filters.dateRange,
        },
      });

      if (response?.data?.success) {
        // Filter projects based on the user's role (Team Leader or Responsible Person)
        const filteredProject = response?.data?.project?.filter((p) => {
          const isLeader = p?.teamLeader?.some((l) => l?._id === team?._id);
          const isResponsible = p?.responsiblePerson?.some((r) => r?._id === team?._id);
          return isLeader || isResponsible;
        });

        // Handle project data based on the role of the team member
        const projectsToSet = (team?.role?.name.toLowerCase() === "coordinator" || team?.role?.name.toLowerCase() === "admin") ? response?.data?.project : filteredProject;

        // Calculate the project priority names with their lengths
        const projectPriorities = projectsToSet?.reduce((accumulator, project) => {
          const priority = project?.projectPriority?.name;
          if (priority) {
            accumulator[priority] = (accumulator[priority] || 0) + 1;
          };
          return accumulator;
        }, {});

        setProjectPriority(projectPriorities);

        // Calculate the project status names with their lengths
        const projectStatuses = projectsToSet?.reduce((accumulator, project) => {
          const status = project?.projectStatus?.status;
          if (status) {
            accumulator[status] = (accumulator[status] || 0) + 1;
          };
          return accumulator;
        }, {});

        setProjectStatus(projectStatuses);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.access) {
      fetchAllProjectForDashboard();
    };
  }, [filters.dateRange, isLoading, team, permissions]);

  useEffect(() => {
    const formatDate = (date) => {
      if (!date) return "";
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    if (startDate && endDate) {
      setFilters((prevFilters) => ({ ...prevFilters, dateRange: `${formatDate(startDate)} - ${formatDate(endDate)}` }));
    } else {
      setFilters((prevFilters) => ({ ...prevFilters, dateRange: "" }));
    };
  }, [startDate, endDate]);

  // Bar chart that show project by status
  const barData = {
    labels: Object.keys(projectStatus),
    datasets: [
      {
        label: " Status ",
        data: Object.values(projectStatus),
        backgroundColor: [
          'rgba(10, 100, 50, 1)',   // Dark Green
          'rgba(255, 180, 0, 1)',   // Dark Yellow
          'rgba(64, 64, 80, 1)',    // Dark Grey
          'rgba(0, 102, 160, 1)',   // Dark Blue 
          'rgba(153, 0, 51, 1)',    // Dark Red
          'rgba(0, 128, 128, 1)',   // Dark Cyan
          'rgba(102, 51, 153, 1)',  // Dark Purple
          'rgba(204, 102, 0, 1)',   // Dark Orange
          'rgba(153, 51, 102, 1)',  // Dark Pink
          'rgba(64, 64, 64, 1)',    // Dark Gray
          'rgba(0, 0, 0, 1)',       // Black
        ],
        borderColor: [
          'rgba(10, 100, 50, 1)',   // Dark Green
          'rgba(255, 180, 0, 1)',   // Dark Yellow
          'rgba(64, 64, 80, 1)',    // Dark Grey
          'rgba(0, 102, 160, 1)',   // Dark Blue 
          'rgba(153, 0, 51, 1)',    // Dark Red
          'rgba(0, 128, 128, 1)',   // Dark Cyan
          'rgba(102, 51, 153, 1)',  // Dark Purple
          'rgba(204, 102, 0, 1)',   // Dark Orange
          'rgba(153, 51, 102, 1)',  // Dark Pink
          'rgba(64, 64, 64, 1)',    // Dark Gray
          'rgba(0, 0, 0, 1)',       // Black
        ],
        borderWidth: 1,
        barThickness: window.innerWidth < 768 ? 15 : 50,
        maxBarThickness: 50,
      },
    ],
  };

  // Pie chart that show project by priority
  const pieData = {
    labels: Object.keys(projectPriority),
    datasets: [
      {
        label: " Priority ",
        data: Object.values(projectPriority),
        backgroundColor: [
          'rgba(255, 206, 86, 1)',   // Light Yellow
          'rgba(75, 192, 192, 1)',   // Light Green
          'rgba(255, 99, 132, 1)',   // Light Red
          'rgba(54, 162, 235, 1)',   // Light Blue         
          'rgba(75, 192, 192, 1)',   // Light Cyan
          'rgba(153, 102, 255, 1)',  // Light Purple
          'rgba(255, 159, 64, 1)',   // Light Orange
          'rgba(255, 205, 210, 1)',  // Light Pink
          'rgba(201, 203, 207, 1)',  // Light Gray
          'rgba(0, 0, 0, 1)',        // Black
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',   // Light Yellow
          'rgba(75, 192, 192, 1)',   // Light Green
          'rgba(255, 99, 132, 1)',   // Light Red
          'rgba(54, 162, 235, 1)',   // Light Blue         
          'rgba(75, 192, 192, 1)',   // Light Cyan
          'rgba(153, 102, 255, 1)',  // Light Purple
          'rgba(255, 159, 64, 1)',   // Light Orange
          'rgba(255, 205, 210, 1)',  // Light Pink
          'rgba(201, 203, 207, 1)',  // Light Gray
          'rgba(0, 0, 0, 1)',        // Black
        ],
        borderWidth: 1,
        hoverOffset: 30,
      },
    ],
  };

  const handleDelete = async (id) => {
    let isdelete = prompt("If you want to delete, type \"yes\".");

    if (isdelete === "yes") {
      try {
        const response = await axios.delete(`${base_url}/api/v1/project/delete-project/${id}`, {
          headers: {
            Authorization: validToken,
          },
        });

        if (response?.data?.success) {
          toast.success("Deleted successfully");
          fetchAllProject();
        };
      } catch (error) {
        console.log("Error while deleting project:", error.message);
        toast.error("Error while deleting");
      };
    } else if (isdelete !== "") {
      alert("Type only \"yes\".");
    };
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/attendance/all-attendance`, {
        headers: {
          Authorization: validToken,
        },
        params: {
          date: new Date().toISOString().split("T")[0],
        },
      });

      if (response?.data?.success) {
        setAttendance(response?.data?.attendance);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (team?.role?.permissions?.attendance?.access) {
      fetchTodayAttendance();
    }
  }, [team?.role?.permissions?.attendance?.access]);

  const fetchAllExpiringProjectDeployment = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/projectDeployment/all-expiring-projectDeployment`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setProjectDeployment(response?.data?.projectDeployment);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (team?.role?.permissions?.projectDeployment?.access) {
      fetchAllExpiringProjectDeployment()
    }
  }, [team?.role?.permissions?.projectDeployment?.access]);

  if (isLoading) {
    return <Preloader />;
  };

  if (!permissions?.access) {
    return <Navigate to="/login" />;
  };

  return (
    <>
      <div className="main-wrapper">
        <div className="page-wrapper">
          <div className="content">
            <div className="row">
              <div className="col-md-12">
                <div className="page-header">
                  <div className="row align-items-center">
                    <div className="col-md-4">
                      <h3 className="page-title">Dashboard</h3>
                    </div>
                    <div className="col-md-5 col-sm-4 dashboard-search">
                      <div className="form-wrap icon-form">
                        <span className="form-icon"><i className="ti ti-search" /></span>
                        <Search />
                      </div>
                    </div>
                    <div className="col-md-8 float-end ms-auto custom-dashboard-heading">
                      <div className="d-flex title-head">
                        <div className="daterange-picker d-flex align-items-center justify-content-center">
                          <div className="form-sort me-2">
                            <DatePicker
                              className="form-control date-picker-dashboard"
                              selected={startDate}
                              onChange={(dates) => {
                                const [start, end] = dates;
                                setStartDate(start);
                                setEndDate(end);
                              }}
                              startDate={startDate}
                              endDate={endDate}
                              selectsRange
                              dateFormat="dd-MM-yyyy"
                              placeholderText="Select date range"
                              isClearable
                              disabledKeyboardNavigation
                            />
                          </div>
                          <div className="head-icons mb-0">
                            <Link to="#" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="Refresh" onClick={() => window.location.reload()}><i className="ti ti-refresh-dot" /></Link>
                            <Link to="#" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="Collapse" id="collapse-header"><i className="ti ti-chevrons-up" /></Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-7">
                    <div className="card">
                      <div className="card-body">
                        <div className="statistic-header">
                          <h4><i className="ti ti-grip-vertical me-1" />Recent Projects</h4>
                          <div className="dropdown statistic-dropdown">
                            <div className="card-select">
                              <ul>
                                <li>
                                  <Link to="#" className="dropdown-toggle" data-bs-toggle="dropdown" >
                                    <i className="ti ti-calendar-check me-2" /> {filters.sort}
                                  </Link>
                                  <div className="dropdown-menu dropdown-menu-end">
                                    <Link to="#" className="dropdown-item" onClick={() => setFilters((prev) => ({ ...prev, sort: "Ascending", page: 1 }))} >
                                      <i className="ti ti-circle-chevron-right" /> Ascending
                                    </Link>
                                    <Link to="#" className="dropdown-item" onClick={() => setFilters((prev) => ({ ...prev, sort: "Descending", page: 1 }))} >
                                      <i className="ti ti-circle-chevron-right" /> Descending
                                    </Link>
                                  </div>
                                </li>
                                {
                                  (permissions?.create) && (
                                    <li>
                                      <Link to="/add-project" className="btn btn-primary" style={{ width: "10.2rem" }}>
                                        <i className="ti ti-square-rounded-plus me-1" />
                                        Add New Project
                                      </Link>
                                    </li>
                                  )
                                }
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="table-responsive custom-table">
                          <table className="table table-bordered table-striped custom-border">
                            <thead className="thead-light">
                              <tr>
                                <th>#</th>
                                {
                                  (permissions?.access) && (
                                    <th>View</th>
                                  )
                                }
                                {
                                  (fieldPermissions?.projectId?.show) && (
                                    <th>Project ID</th>
                                  )
                                }
                                {
                                  (fieldPermissions?.projectName?.show) && (
                                    <th>Project Name</th>
                                  )
                                }
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {
                                project?.map((p, index) => (
                                  <tr key={p?._id}>
                                    <td>{(filters.page - 1) * filters.limit + index + 1}</td>
                                    {
                                      (permissions?.access) && (
                                        <td><Link to={permissions.access ? `/single-project-detail/${p?._id}` : "/"}><i className="fas fa-eye"></i></Link></td>
                                      )
                                    }
                                    {
                                      (fieldPermissions?.projectId?.show) && (
                                        <td>{p?.projectId}</td>
                                      )
                                    }
                                    {
                                      (fieldPermissions?.projectName?.show) && (
                                        <td>{p?.projectName}</td>
                                      )
                                    }
                                    <td>
                                      <div className="table-action">
                                        <Link to="#" className="action-icon" data-bs-toggle="dropdown" aria-expanded="false">
                                          <i className="fa fa-ellipsis-v"></i>
                                        </Link>
                                        <div className="dropdown-menu dropdown-menu-right">
                                          {
                                            (permissions?.update) && (
                                              <Link to={`/edit-project/${p?._id}`} className="dropdown-item">
                                                <i className="ti ti-edit text-blue"></i>
                                                Update
                                              </Link>
                                            )
                                          }
                                          {
                                            permissions?.update && permissions?.delete && (
                                              <hr className="horizontal-line" />
                                            )
                                          }
                                          {
                                            (permissions?.delete) && (
                                              <Link to="#" className="dropdown-item" onClick={() => handleDelete(p?._id)}>
                                                <i className="ti ti-trash text-danger"></i>
                                                Delete
                                              </Link>
                                            )
                                          }
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              }
                            </tbody>
                          </table>
                        </div>
                        <div className="row align-items-center">
                          <div className="col-md-4 custom-pagination">
                            <div className="datatable-length">
                              <div className="dataTables_length" id="project-list_length">
                                <label>
                                  Show
                                  <select name="project-list_length" value={filters.limit} onChange={(e) => setFilters((prev) => ({ ...prev, limit: e.target.value, page: 1 }))} aria-controls="project-list" className="form-select form-select-sm">
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="15">15</option>
                                    <option value="20">20</option>
                                    <option value="25">25</option>
                                    <option value={total}>All</option>
                                  </select>
                                </label>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 custom-pagination">
                            {
                              (filteredTotal === 0) ? (
                                <span style={{ textAlign: "center", fontSize: "1rem", fontWeight: "600" }}>No Data</span>
                              ) : loading && permissions?.access ? (
                                <h5 style={{ textAlign: "center", color: "#00918E" }}>
                                  <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                  </div>
                                </h5>
                              ) : (
                                null
                              )
                            }
                          </div>
                          <div className="col-md-4 custom-pagination">
                            <div className="datatable-paginate">
                              <div className="dataTables_paginate paging_simple_numbers" id="project-list_paginate">
                                <ul className="pagination">
                                  <li className={`paginate_button page-item previous ${filters.page === 1 ? "disabled" : ""}`} id="project-list_previous">
                                    <Link to="#" onClick={() => setFilters((prev) => ({ ...prev, page: filters.page - 1 }))} aria-controls="project-list" aria-disabled={filters.page === 1} role="link" data-dt-idx="previous" tabIndex="-1" className="page-link" >
                                      <i className="fa fa-angle-left"></i> Prev
                                    </Link>
                                  </li>
                                  {
                                    [...Array(Math.ceil(total / filters.limit)).keys()].map((num) => (
                                      <li className={`paginate_button page-item page-number ${filters.page === num + 1 ? "active" : ""}`} key={num}>
                                        <Link to="#" onClick={() => setFilters((prev) => ({ ...prev, page: num + 1 }))} aria-controls="project-list" role="link" aria-current={filters.page === num + 1} data-dt-idx={num} tabIndex="0" className="page-link">
                                          {num + 1}
                                        </Link>
                                      </li>
                                    ))
                                  }
                                  <li className="paginate_button page-item page-number-mobile active">
                                    {filters.page}
                                  </li>
                                  <li className={`paginate_button page-item next ${filters.page === Math.ceil(total / filters.limit) ? "disabled" : ""}`} id="project-list_next">
                                    <Link to="#" onClick={() => setFilters((prev) => ({ ...prev, page: filters.page + 1 }))} className="page-link" aria-controls="project-list" role="link" data-dt-idx="next" tabIndex="0">
                                      Next <i className="fa fa-angle-right"></i>
                                    </Link>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Pie chart project by priority */}
                  <div className="col-md-5 d-flex">
                    <div className="card w-100">
                      <div className="card-body">
                        <div className="statistic-header">
                          <h4><i className="ti ti-grip-vertical me-1" />Projects By Priority</h4>
                        </div>
                        <Pie data={pieData} />
                      </div>
                    </div>
                  </div>
                  {/* /Pie chart project by priority */}
                </div>

                {/* Attendance */}
                <div className="row">
                  <div className="col-md-12">
                    <div className="card">
                      <div className="card-body">
                        <div className="statistic-header">
                          <h4><i className="ti ti-grip-vertical me-1" />Today&apos;s Attendance</h4>
                        </div>
                        <div className="table-responsive custom-table">
                          <div className="table-responsive custom-table">
                            <table className="table table-bordered table-striped custom-border">
                              <thead className="thead-light">
                                <tr>
                                  <th className="no-sort">
                                    <label className="checkboxs"><input type="checkbox" id="select-all" /><span className="checkmarks" /></label>
                                  </th>
                                  <th>#</th>
                                  <th>Date</th>
                                  <th>Employee</th>
                                  <th>Punch In</th>
                                  <th>Punch Out</th>
                                  <th>Late In</th>
                                  <th>Hours Worked</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {
                                  attendance?.map((d, index) => (
                                    <tr key={d?._id}>
                                      <th className="no-sort">
                                        <label className="checkboxs"><input type="checkbox" id="select-all" /><span className="checkmarks" /></label>
                                      </th>
                                      <td>{(filters.page - 1) * filters.limit + index + 1}</td>
                                      <td>{formatDate(d?.attendanceDate)}</td>
                                      <td>{d?.employee?.name}</td>
                                      <td>{d?.punchInTime ? formatTimeWithAmPm(d?.punchInTime) : <><hr /></>}</td>
                                      <td>{d?.punchOutTime ? formatTimeWithAmPm(d?.punchOutTime) : <><hr /></>}</td>
                                      <td>
                                        {
                                          d?.lateIn
                                            ? d?.lateIn === "00:00"
                                              ? "On Time"
                                              : formatTimeToHoursMinutes(d?.lateIn)
                                            : <><hr /></>
                                        }
                                      </td>
                                      <td>
                                        {
                                          d?.hoursWorked
                                            ? d?.hoursWorked === "00:00"
                                              ? <><hr /></>
                                              : formatTimeToHoursMinutes(d?.hoursWorked)
                                            : <><hr /></>
                                        }
                                      </td>
                                      <td>{d?.status}</td>
                                    </tr>
                                  ))
                                }
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Attendance */}

                {/* Project Deployment */}
                <div className="row">
                  <div className="col-md-12">
                    <div className="card">
                      <div className="card-body">
                        <div className="statistic-header">
                          <h4><i className="ti ti-grip-vertical me-1" />Expiring Project Deployment</h4>
                        </div>
                        <div className="table-responsive custom-table">
                          <table className="table table-bordered table-striped custom-border">
                            <thead className="thead-light">
                              <tr>
                                <th className="no-sort">
                                  <label className="checkboxs"><input type="checkbox" id="select-all" /><span className="checkmarks" /></label>
                                </th>
                                <th>#</th>
                                <th>Website Name</th>
                                <th>Client Name</th>
                                <th>Domain Status</th>
                                <th>Hosting Status</th>
                                <th>SSL Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {
                                projectDeployment?.map((d, index) => (
                                  <tr key={d?._id}>
                                    <th className="no-sort">
                                      <label className="checkboxs"><input type="checkbox" id="select-all" /><span className="checkmarks" /></label>
                                    </th>
                                    <td>{(filters.page - 1) * filters.limit + index + 1}</td>
                                    <td>{d?.websiteName}</td>
                                    <td>{d?.client?.name}</td>
                                    <td>
                                      {
                                        (parseInt(d?.domainExpireIn) <= 30) ? (
                                          <div style={{
                                            color: parseInt(d?.domainExpireIn) <= 30 ? "red" : "green",
                                          }}>
                                            Expire in {d?.domainExpireIn}
                                          </div>
                                        ) : (
                                          <div style={{
                                            color: d?.domainExpiryStatus === "Expired" ? "red" : "green",
                                          }}>
                                            {d?.domainExpiryStatus}
                                          </div>
                                        )
                                      }
                                    </td>
                                    <td>
                                      {
                                        (parseInt(d?.hostingExpireIn) <= 30) ? (
                                          <div style={{
                                            color: parseInt(d?.hostingExpireIn) <= 30 ? "red" : "green",
                                          }}>
                                            Expire in {d?.hostingExpireIn}
                                          </div>
                                        ) : (
                                          <div style={{
                                            color: d?.hostingExpiryStatus === "Expired" ? "red" : "green",
                                          }}>
                                            {d?.hostingExpiryStatus}
                                          </div>
                                        )
                                      }
                                    </td>
                                    <td>
                                      {
                                        (parseInt(d?.sslExpireIn) <= 30) ? (
                                          <div style={{
                                            color: parseInt(d?.sslExpireIn) <= 30 ? "red" : "green",
                                          }}>
                                            Expire in {d?.sslExpireIn}
                                          </div>
                                        ) : (
                                          <div style={{
                                            color: d?.sslExpiryStatus === "Expired" ? "red" : "green",
                                          }}>
                                            {d?.sslExpiryStatus}
                                          </div>
                                        )
                                      }
                                    </td>
                                  </tr>
                                ))
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Project Deployemnt */}

                {/* Bar chart project by status */}
                <div className="row">
                  <div className="col-md-12">
                    <div className="card">
                      <div className="card-body">
                        <div className="statistic-header">
                          <h4><i className="ti ti-grip-vertical me-1" />Projects By Status</h4>
                        </div>
                        <Bar data={barData} />
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Bar chart project by status */}
              </div>
            </div>
          </div>
        </div>
        {/* /Page Wrapper */}
      </div>
    </>
  );
};

export default ProjectDashboard;