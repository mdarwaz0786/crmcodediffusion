/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from 'axios';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from "../../context/authContext.jsx";
import html2pdf from "html2pdf.js";
import * as XLSX from 'xlsx';
import Preloader from "../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const Salary = () => {
  const { validToken, team, isLoading } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate previous month and year
  const currentDate = new Date();
  const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
  const initialYear = previousMonth.getFullYear();
  const initialMonth = (previousMonth.getMonth() + 1).toString().padStart(2, "0");

  const [filters, setFilters] = useState({
    year: initialYear,
    month: initialMonth,
  });

  const permissions = team?.role?.permissions?.salary;

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/v1/salary/monthly-salary`, {
        headers: {
          Authorization: validToken,
        },
        params: {
          month: `${filters.year}-${filters.month}`,
        },
      });

      if (response?.data?.success) {
        setData(response?.data?.salaryData);
      };
    } catch (error) {
      console.log(error.message);
    } finally {
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
  }, [filters.month, filters.year, isLoading, team, permissions]);

  const exportSalaryListAsExcel = () => {
    if (data?.length === 0) {
      alert("No data available to export");
      return;
    };

    const exportData = data?.map((entry, index) => ({
      "#": index + 1 || "1",
      "Month": `${filters.month}-${filters.year}` || "N/A",
      "Employee Name": entry?.employeeName || "N/A",
      "Monthly Salary": entry?.monthlySalary || "N/A",
      "Total Salary": entry?.totalSalary || "0",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Calculate column widths dynamically
    const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...exportData.map((row) => (row[key] ? row[key].toString().length : 0))) + 2
    }));

    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Salary");

    XLSX.writeFile(workbook, `${filters.month || ""}-${filters.year || ""}-Salary.xlsx`);
  };

  const exportSalaryListAsPdf = () => {
    const element = document.querySelector("#exportSalaryList");
    const options = {
      filename: `${filters.month || ""}-${filters.year || ""}-Salary`,
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
        <div className="content" id="exportSalaryList">
          <div className="row">
            <div className="col-md-12">
              {/* Page Header */}
              <div className="page-header">
                <div className="row align-items-center">
                  <div className="col-4">
                    <h4 className="page-title">Salary</h4>
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
                          <label className="pb-1">Export:</label>
                          <div className="export-dropdwon">
                            <Link to="#" className="dropdown-toggle" data-bs-toggle="dropdown">
                              <i className="ti ti-package-export" />
                              Export
                            </Link>
                            <div className="dropdown-menu  dropdown-menu-end">
                              <ul>
                                <li>
                                  <Link to="#" onClick={() => setTimeout(() => { exportSalaryListAsPdf() }, 0)}>
                                    <i className="ti ti-file-type-pdf text-danger" />
                                    Export as PDF
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#" onClick={() => setTimeout(() => { exportSalaryListAsExcel() }, 0)}>
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

                  {
                    loading ? (
                      <h4 style={{ textAlign: "center", marginTop: "1rem" }}>Calculating Salary...</h4>
                    ) : (
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
                                <th>Monthly Salary</th>
                                <th>Total Salary</th>
                                <th>Salary Detail</th>
                                <th>Salary Slip</th>
                              </tr>
                            </thead>
                            <tbody>
                              {
                                data?.map((d, index) => (
                                  <tr key={d?._id}>
                                    <td className="no-sort">
                                      <label className="checkboxs"><input type="checkbox" id="select-all" /><span className="checkmarks" /></label>
                                    </td>
                                    <td>{index + 1}</td>
                                    <td>{d?.employeeName}</td>
                                    <td>{d?.monthlySalary}</td>
                                    <td>{d?.totalFinalSalary?.toFixed(2)}</td>
                                    <td>
                                      <div><strong>One Minute Salary: </strong>{d?.oneMinuteSalary}</div>
                                      <div><strong>Per Day Salary: </strong>{d?.dailySalary}</div>
                                      <div><strong>Salary Of Weekly Off ({`${d?.totalWeeklyOff}`}): </strong>{d?.totalSalaryOfWeeklyOff}</div>
                                      <div><strong>Salary Of Holidays ({`${d?.totalHolidays}`}): </strong>{d?.totalSalaryOfHoliday}</div>
                                      <div><strong>Salary Of On Leave ({`${d?.totalOnLeave}`}): </strong>{d?.totalSalaryOfOnLeave}</div>
                                      <div><strong>Salary Of Comp Off ({`${d?.totalCompOff}`}): </strong>{d?.totalSalaryOfCompOff}</div>
                                      <div><strong>Salary Of Working Hours ({`${d?.employeeHoursWorked}`} = {`${d?.employeeMinutesWorked}`} Minutes): </strong>{d?.totalSalaryOfWorkedHours}</div>
                                      <div><strong>Total Salary: </strong>{d?.totalFinalSalary?.toFixed(2)}</div>
                                    </td>
                                    <td style={{ padding: "0.3rem" }}>
                                      <Link style={{ marginRight: "1rem" }} to={d?.salaryPaid === false ? `/pay-salary/${d?.employeeId}/${filters.month}/${filters.year}/${d?.totalSalary}/${encodeURIComponent(JSON.stringify(d))}` : ""}><button className="btn btn-primary">{d?.salaryPaid ? "Paid" : "Pay Salary"}</button></Link>
                                      {
                                        d?.salaryPaid && (
                                          <Link style={{ marginRight: "1rem" }} to={`/salary-slip/${d?.employeeId}/${filters.month}/${filters.year}`}><button className="btn btn-primary">View</button></Link>
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

export default Salary;