/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from 'axios';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from "../../context/authContext.jsx";
import html2pdf from "html2pdf.js";
import * as XLSX from 'xlsx';
import Preloader from "../../Preloader.jsx";
import formatDate from "../../Helper/formatDate.js";
import formatTimeToHoursMinutes from "../../Helper/formatTimeToHoursMinutes.js";
import formatTimeWithAmPm from "../../Helper/formatTimeWithAmPm.js";
import calculateTimeDifference from "../../Helper/calculateTimeDifference.js";
const base_url = import.meta.env.VITE_API_BASE_URL;

const WorkDetail = () => {
  const [data, setData] = useState([]);
  const [project, setProject] = useState([]);
  const [selectedProject, setSelectProject] = useState("");
  const [employee, setEmployee] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [singleEmployee, setSingleEmployee] = useState("");
  const [total, setTotal] = useState("");
  const [loading, setLoading] = useState(true);
  const { validToken, team, isLoading } = useAuth();
  const permissions = team?.role?.permissions?.attendance;
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    page: 1,
    limit: 1,
  });

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
    if (!isLoading && team && permissions?.access) {
      fetchAllProject();
    };
  }, [isLoading, team, permissions]);

  const fetchAllEmployee = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/team/all-team`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setEmployee(response?.data?.team);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.access) {
      fetchAllEmployee();
    };
  }, [isLoading, team, permissions]);

  const fetchSingleEmployee = async (selectedEmployee) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/team/single-team/${selectedEmployee}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setSingleEmployee(response?.data?.team);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.access && selectedEmployee) {
      fetchSingleEmployee(selectedEmployee);
    };
  }, [isLoading, team, permissions, selectedEmployee]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/v1/project//work-detail`, {
        headers: {
          Authorization: validToken,
        },
        params: {
          year: filters.year,
          month: filters.month,
          employeeId: selectedEmployee,
          projectId: selectedProject,
          page: filters.page,
          limit: filters.limit,
        },
      });

      if (response?.data?.success) {
        setData(response?.data?.data);
        setTotal(response?.data?.totalCount);
        setLoading(false);
      };
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    };
  };

  const handleYearChange = (e) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      year: e.target.value,
      page: 1,
    }));
  };

  const handleMonthChange = (e) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      month: e.target.value,
      page: 1,
    }));
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.access) {
      fetchAllData();
    };
  }, [filters.month, filters.year, selectedEmployee, selectedProject, filters.limit, filters.page, isLoading, team, permissions]);

  const exportWorkSummaryListAsExcel = () => {
    const element = document.querySelector("#exportWorkSummaryList");
    if (!element) return;
    const workbook = XLSX.utils.table_to_book(element, { sheet: "Work Summary List" });
    const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    const blob = new Blob([s2ab(excelData)], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filters.month}-${filters.year}-${singleEmployee?.name ? singleEmployee?.name : "all"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  function s2ab(s) {
    const buffer = new ArrayBuffer(s.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xFF;
    };
    return buffer;
  };

  const exportWorkSummaryListAsPdf = () => {
    const element = document.querySelector("#exportWorkSummaryList");
    const options = {
      filename: `${filters.month}-${filters.year}-${singleEmployee?.name ? singleEmployee?.name : "all"}`,
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
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content" id="exportWorkSummaryList">
          <div className="row">
            <div className="col-md-12">
              {/* Page Header */}
              <div className="page-header">
                <div className="row align-items-center">
                  <div className="col-4">
                    <h4 className="page-title">Work Summary<span className="count-title">{total}</span></h4>
                  </div>
                  <div className="col-8 text-end">
                    <div className="head-icons">
                      <Link to="#" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="Refresh" onClick={() => window.location.reload()}>
                        <i className="ti ti-refresh-dot" />
                      </Link>
                      <Link to="#" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="Collapse" id="collapse-header">
                        <i className="ti ti-chevrons-up" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Page Header */}

              <div className="card main-card">
                <div className="card-body">
                  {/* Filter */}
                  <div className="filter-section filter-flex">
                    <div className="sortby-list">
                      <ul>
                        <li>
                          <label className="pb-1">Year:</label>
                          <select
                            id="year"
                            name="year"
                            value={filters.year}
                            onChange={handleYearChange}
                            className="form-select"
                          >
                            <option value="">All</option>
                            {
                              // Generate the years dynamically, starting from the current year and going backwards 10 year
                              Array.from({ length: 10 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return <option key={year} value={year}>{year}</option>;
                              })
                            }
                          </select>
                        </li>
                        <li>
                          <label className="pb-1">Month:</label>
                          <select
                            id="month"
                            name="month"
                            value={filters.month}
                            onChange={handleMonthChange}
                            className="form-select"
                          >
                            <option value="">All</option>
                            <option value="01">January</option>
                            <option value="02">February</option>
                            <option value="03">March</option>
                            <option value="04">April</option>
                            <option value="05">May</option>
                            <option value="06">June</option>
                            <option value="07">July</option>
                            <option value="08">August</option>
                            <option value="09">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                          </select>
                        </li>
                        <li>
                          <label className="pb-1">Employee:</label>
                          <select className="form-select" name="employee" id="employee" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                            <option value="">All</option>
                            {
                              employee?.map((e) => (
                                <option key={e?._id} value={e?._id}>{e?.name}</option>
                              ))
                            }
                          </select>
                        </li>
                        <li>
                          <label className="pb-1">Project:</label>
                          <select className="form-select" name="project" id="project" value={selectedProject} onChange={(e) => setSelectProject(e.target.value)}>
                            <option value="">All</option>
                            {
                              project?.map((p) => (
                                <option key={p?._id} value={p?._id}>{p?.projectName}</option>
                              ))
                            }
                          </select>
                        </li>
                        {
                          (permissions?.export) && (
                            <li>
                              <label className="pb-1">Export:</label>
                              <div className="export-dropdwon">
                                <Link to="#" className="dropdown-toggle" data-bs-toggle="dropdown">
                                  <i className="ti ti-package-export" />
                                  Export
                                </Link>
                                <div className="dropdown-menu dropdown-menu-start">
                                  <ul>
                                    <li>
                                      <Link to="#" onClick={() => setTimeout(() => { exportWorkSummaryListAsPdf() }, 0)}>
                                        <i className="ti ti-file-type-pdf text-danger" />
                                        Export as PDF
                                      </Link>
                                    </li>
                                    <li>
                                      <Link to="#" onClick={() => setTimeout(() => { exportWorkSummaryListAsExcel() }, 0)}>
                                        <i className="ti ti-file-spreadsheet text-success" />
                                        Export as EXCEL
                                      </Link>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </li>
                          )
                        }
                      </ul>
                    </div>
                  </div>
                  {/* /Filter */}

                  {/* Work detail List */}
                  {
                    data?.map((w) => (
                      <div className="table-responsive custom-table" style={{ marginBottom: "2rem" }} key={w?._id}>
                        <h5 style={{ marginBottom: "10px" }}>{w?.teamMember?.name}</h5>
                        <table className="table table-bordered table-striped custom-border">
                          <thead className="thead-light">
                            <tr>
                              <th>#</th>
                              <th>Date</th>
                              <th>Project Name</th>
                              <th>Work Summary</th>
                              <th>Start Time</th>
                              <th>End Time</th>
                              <th>Spent Hour</th>
                            </tr>
                          </thead>
                          <tbody>
                            {
                              w?.workDetails?.map((s, index) => (
                                <tr key={index}>
                                  <td style={{ padding: "0.5rem" }}>{index + 1}</td>
                                  <td>{formatDate(s?.date)}</td>
                                  <td>{s?.projectName}</td>
                                  <td
                                    style={{ cursor: "pointer" }}
                                    title={s?.workDescription.length > 30 && s?.workDescription}
                                  >
                                    {
                                      s?.workDescription.length > 30
                                        ? `${s?.workDescription.substring(0, 30)}...`
                                        : s?.workDescription
                                    }
                                  </td>
                                  <td>{formatTimeWithAmPm(s?.startTime)}</td>
                                  <td>{formatTimeWithAmPm(s?.endTime)}</td>
                                  <td>{formatTimeToHoursMinutes(calculateTimeDifference(s?.startTime, s?.endTime))}</td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </table>
                      </div>
                    ))
                  }
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
                        (total === 0) ? (
                          <span style={{ textAlign: "center", fontSize: "1rem", fontWeight: "600" }}>No Data</span>
                        ) : loading ? (
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
                  {/* /Work detail list */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}
    </>
  );
};

export default WorkDetail;