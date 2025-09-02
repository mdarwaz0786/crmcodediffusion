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
import { toast } from "react-toastify";
const base_url = import.meta.env.VITE_API_BASE_URL;

const LatePunchIn = () => {
  const { validToken, team, isLoading } = useAuth();
  const [status, setStatus] = useState({});
  const [data, setData] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [singleEmployee, setSingleEmployee] = useState("");
  const [total, setTotal] = useState("");
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState({});
  const [filters, setFilters] = useState({
    year: "",
    month: "",
    sort: "Descending",
    page: 1,
    limit: 20,
  });

  const permission = team?.role?.permissions?.latePunchIn;

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
    if (!isLoading && team && permission?.access) {
      fetchAllEmployee();
    };
  }, [isLoading, team, permission]);

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
    if (!isLoading && team && selectedEmployee && permission?.access) {
      fetchSingleEmployee(selectedEmployee);
    };
  }, [isLoading, team, selectedEmployee, permission]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/v1/latePunchIn/all-latePunchIn`, {
        headers: {
          Authorization: validToken,
        },
        params: {
          year: filters.year,
          month: filters.month,
          employeeId: selectedEmployee,
          sort: filters.sort,
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
    if (!isLoading && team && permission?.access) {
      fetchAllData();
    };
  }, [filters.month, filters.year, selectedEmployee, filters.limit, filters.page, filters.sort, isLoading, team, permission]);

  const exportLatePunchInListAsExcel = () => {
    if (data?.length === 0) {
      alert("No data available to export");
      return;
    };

    const exportData = data?.map((entry, index) => ({
      "#": index + 1 || "1",
      "Employee Name": entry?.employee?.name || "N/A",
      "Attendance Date": formatDate(entry?.attendanceDate) || "N/A",
      "Punch In Time": `${entry?.punchInTime}` || "N/A",
      "Status": entry?.status || "N/A",
      "Approved By": entry?.approvedBy || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Calculate column widths dynamically
    const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...exportData.map((row) => (row[key] ? row[key].toString().length : 0))) + 2
    }));

    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LatePunchIn");

    XLSX.writeFile(workbook, `${filters.month || ""}-${filters.year || ""}-${singleEmployee?.name || ""}-Late-Punch-In.xlsx`);
  };

  const exportLatePunchInListAsPdf = () => {
    const element = document.querySelector("#exportLatePunchInList");
    const options = {
      filename: `${filters.month || ""}-${filters.year || ""}-${singleEmployee?.name || ""}-Late-Punch-In`,
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

  const handleUpdateStatus = async (e, id) => {
    e.preventDefault();

    try {
      setApproving((prev) => ({ ...prev, [id]: true }));

      if (!status[id]) {
        return toast.error("Select status");
      };

      const response = await axios.put(`${base_url}/api/v1/latePunchIn/update-latePunchIn/${id}`,
        { status: status[id], approvedBy: team?._id },
        {
          headers: {
            Authorization: validToken,
          },
        },
      );

      if (response?.data?.success) {
        setStatus((prev) => ({ ...prev, [id]: "" }));
        fetchAllData();
        toast.success("Updated Successfully");
      };
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error while updating");
    } finally {
      setApproving((prev) => ({ ...prev, [id]: false }));
    };
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (!permission?.access) {
    return <Navigate to="/" />;
  };

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content" id="exportLatePunchInList">
          <div className="row">
            <div className="col-md-12">
              {/* Page Header */}
              <div className="page-header">
                <div className="row align-items-center">
                  <div className="col-4">
                    <h4 className="page-title">Late Punch In<span className="count-title">{total}</span></h4>
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
                          <label className="pb-1">Sort:</label>
                          <div className="sort-dropdown drop-down">
                            <Link to="#" className="dropdown-toggle" data-bs-toggle="dropdown"><i className="ti ti-sort-ascending-2" />{filters.sort}</Link>
                            <div className="dropdown-menu  dropdown-menu-start">
                              <ul>
                                <li>
                                  <Link to="#" onClick={() => setFilters((prev) => ({ ...prev, sort: "Ascending", page: 1 }))}>
                                    <i className="ti ti-circle-chevron-right" />
                                    Ascending
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#" onClick={() => setFilters((prev) => ({ ...prev, sort: "Descending", page: 1 }))}>
                                    <i className="ti ti-circle-chevron-right" />
                                    Descending
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </li>
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
                          <label className="pb-1">Export:</label>
                          <div className="export-dropdwon">
                            <Link to="#" className="dropdown-toggle" data-bs-toggle="dropdown">
                              <i className="ti ti-package-export" />
                              Export
                            </Link>
                            <div className="dropdown-menu  dropdown-menu-end">
                              <ul>
                                <li>
                                  <Link to="#" onClick={() => setTimeout(() => { exportLatePunchInListAsPdf() }, 0)}>
                                    <i className="ti ti-file-type-pdf text-danger" />
                                    Export as PDF
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#" onClick={() => setTimeout(() => { exportLatePunchInListAsExcel() }, 0)}>
                                    <i className="ti ti-file-spreadsheet text-success" />
                                    Export as EXCEL
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  {/* /Filter */}

                  {/* Late Punch In List */}
                  <div className="table-responsive custom-table">
                    <div className="table-responsive custom-table">
                      <table className="table table-bordered table-striped custom-border">
                        <thead className="thead-light">
                          <tr>
                            <th className="no-sort">
                              <label className="checkboxs"><input type="checkbox" id="select-all" /><span className="checkmarks" /></label>
                            </th>
                            <th>#</th>
                            <th>Employee Name</th>
                            <th>Attendance Date</th>
                            <th>Punch In Time</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            data?.map((d, index) => (
                              <tr key={d?._id}>
                                <td className="no-sort">
                                  <label className="checkboxs"><input type="checkbox" id="select-all" /><span className="checkmarks" /></label>
                                </td>
                                <td>{(filters.page - 1) * filters.limit + index + 1}</td>
                                <td>{d?.employee?.name}</td>
                                <td>{formatDate(d?.attendanceDate)}</td>
                                <td>{d?.punchInTime}</td>
                                <td>
                                  <form style={{ display: "flex", columnGap: "0.5rem" }} onSubmit={(e) => handleUpdateStatus(e, d?._id)}>
                                    <select
                                      value={status[d?._id] || d?.status}
                                      onChange={(e) => setStatus({ ...status, [d?._id]: e.target.value })}
                                      className="form-select"
                                    >
                                      <option value="">Select Status</option>
                                      <option value="Pending">Pending</option>
                                      <option value="Approved">Approved</option>
                                      <option value="Rejected">Rejected</option>
                                    </select>
                                    {
                                      approving[d?._id] ? (
                                        <div style={{ textAlign: "center", color: "#ffb300" }}>
                                          <div className="spinner-border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <button type="submit" className="btn btn-primary">Update</button>
                                      )
                                    }
                                  </form>
                                </td>
                              </tr>
                            ))
                          }
                        </tbody>
                      </table>
                    </div>
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
                        (total === 0) ? (
                          <span style={{ textAlign: "center", fontSize: "1rem", fontWeight: "600" }}>No Data</span>
                        ) : loading ? (
                          <h5 style={{ textAlign: "center", color: "#ffb300" }}>
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
                  {/* /Late Punch In List */}
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

export default LatePunchIn;