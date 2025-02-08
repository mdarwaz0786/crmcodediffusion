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
import Calendar from "./Calender.jsx";
import AttendanceSummary from "./AttendanceSummary.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const AttendanceList = () => {
  const { validToken, team, isLoading } = useAuth();
  const [data, setData] = useState([]);
  const [monthlyStatics, setMonthlyStatics] = useState("");
  const [employee, setEmployee] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [singleEmployee, setSingleEmployee] = useState("");
  const [loading, setLoading] = useState(true);
  const permissions = team?.role?.permissions?.attendance;
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: (new Date().getMonth() + 1).toString().padStart(2, "0"),
  });

  const fetchAllEmployee = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/team/all-team`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setEmployee(response?.data?.team);
        if (response?.data?.team?.length > 0) {
          setSelectedEmployee(response?.data?.team[0]?._id);
        };
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
      const response = await axios.get(`${base_url}/api/v1/newAttendance/monthly-newStatistic`, {
        headers: {
          Authorization: validToken,
        },
        params: {
          month: `${filters.year}-${filters.month}`,
          employeeId: selectedEmployee,
        },
      });
      if (response?.data?.success) {
        setData(response?.data?.calendarData);
        setMonthlyStatics(response?.data?.monthlyStatics);
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
    if (!isLoading && team && selectedEmployee && filters.month && filters.year && permissions?.access) {
      fetchAllData();
    };
  }, [filters.month, filters.year, selectedEmployee, isLoading, team, permissions]);

  const exportAttendanceListAsExcel = () => {
    if (data?.length === 0) {
      alert("No data available to export");
      return;
    };

    const exportData = data?.map((entry, index) => ({
      "#": index + 1 || "1",
      "Date": formatDate(entry?.attendanceDate) || "N/A",
      "Employee Name": singleEmployee?.name || "N/A",
      "Punch in": formatTimeWithAmPm(entry?.punchInTime) || "N/A",
      "Punch out": formatTimeWithAmPm(entry?.punchOutTime) || "N/A",
      "Late in": entry?.lateIn === "00:00" ? "On Time" : formatTimeToHoursMinutes(entry?.lateIn) || "N/A",
      "Hours Worked": formatTimeToHoursMinutes(entry?.hoursWorked) || "N/A",
      "Status": entry?.status || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Calculate column widths dynamically
    const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...exportData.map((row) => (row[key] ? row[key].toString().length : 0))) + 2,
    }));

    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    XLSX.writeFile(workbook, `${filters.month || ""}-${filters.year || ""}-${singleEmployee?.name || ""}-Attendance.xlsx`);
  };

  const exportAttendanceListAsPdf = () => {
    const element = document.querySelector("#exportAttendanceList");
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
        <div className="content" id="exportAttendanceList">
          <div className="row">
            <div className="col-md-12">
              {/* Page Header */}
              <div className="page-header">
                <div className="row align-items-center">
                  <div className="col-4">
                    <h4 className="page-title">Attendances<span className="count-title"></span></h4>
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
                            {
                              employee?.map((e) => (
                                <option key={e?._id} value={e?._id}>{e?.name}</option>
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
                                <div className="dropdown-menu  dropdown-menu-end">
                                  <ul>
                                    <li>
                                      <Link to="#" onClick={() => setTimeout(() => { exportAttendanceListAsPdf() }, 0)}>
                                        <i className="ti ti-file-type-pdf text-danger" />
                                        Export as PDF
                                      </Link>
                                    </li>
                                    <li>
                                      <Link to="#" onClick={() => setTimeout(() => { exportAttendanceListAsExcel() }, 0)}>
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

                  <h4 style={{ textAlign: "center", marginBottom: "2rem", marginTop: "1rem" }}>{singleEmployee?.name}</h4>

                  {/* Attendance List */}
                  {
                    loading ? (
                      <h4 style={{ textAlign: "center" }}>Loading...</h4>
                    ) : (
                      <>
                        <Calendar attendanceData={data} employeeId={selectedEmployee} month={filters.month} year={filters.year} />
                        <div style={{ marginTop: "3rem" }}>
                          <AttendanceSummary attendance={monthlyStatics} />
                        </div>
                      </>
                    )
                  }
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

export default AttendanceList;