/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { Link, useNavigate, useParams } from "react-router-dom";
import logo from "../../Assets/logo.png";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { useEffect, useState } from "react";
import numberToWords from "../../Helper/numberToWord.js";
import Calender from "../Attendance/Calender.jsx";
import formatDate from "../../Helper/formatDate.js"
const base_url = import.meta.env.VITE_API_BASE_URL;

const SalarySlip = () => {
  const navigate = useNavigate();
  const { employeeId, month, year, totalSalary, transactionId } = useParams();
  const { validToken, team, isLoading } = useAuth("");
  const [monthlyStatistic, setMonthlyStatistic] = useState("");
  const [employee, setEmployee] = useState("");
  const [data, setData] = useState([]);

  const fetchEmployee = async (employeeId) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/team/single-team/${employeeId}`, {
        headers: {
          Authorization: validToken,
        },
      });
      if (response?.data?.success) {
        setEmployee(response?.data?.team);
      };
    } catch (error) {
      console.log("Error fetching employee:", error.message);
    };
  };

  useEffect(() => {
    if (employeeId && validToken && !isLoading && (team?.role?.name?.toLowerCase() === "admin" || team?.role?.name?.toLowerCase() === "hr")) {
      fetchEmployee(employeeId);
    };
  }, [employeeId, validToken, team, isLoading]);

  const fetchMonthlyStatistic = async () => {
    try {
      const params = {};

      if (month && year) {
        const formattedMonth = month.toString().padStart(2, "0");
        params.month = `${year}-${formattedMonth}`;
      };

      if (employeeId) {
        params.employeeId = employeeId;
      };

      const response = await axios.get(`${base_url}/api/v1/attendance/monthly-statistic`, {
        params,
        headers: {
          Authorization: validToken,
        },
      });
      if (response?.data?.success) {
        setMonthlyStatistic(response?.data?.attendance);
      };
    } catch (error) {
      console.log("Error while fetching monthly statistic:", error.message);
    };
  };

  useEffect(() => {
    if (employeeId && validToken && !isLoading && (team?.role?.name?.toLowerCase() === "admin" || team?.role?.name?.toLowerCase() === "hr")) {
      fetchMonthlyStatistic();
    };
  }, [employeeId, month, year, validToken, team, isLoading]);

  const fetchAllData = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/attendance/all-attendance`, {
        headers: {
          Authorization: validToken,
        },
        params: {
          year,
          month,
          employeeId,
        },
      });

      if (response?.data?.success) {
        setData(response?.data?.attendance);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && employeeId && month && year) {
      fetchAllData();
    };
  }, [isLoading, team, month, year, employeeId]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  function getMonthName(monthNumber) {
    const index = parseInt(monthNumber, 10) - 1;
    return months[index] || "Invalid Month";
  };

  const exportCombinedAsPdf = () => {
    const salaryElement = document.querySelector("#exportSalary");
    const attendanceElement = document.querySelector("#exportAttendance");

    // Combine both elements into a single container
    const combinedElement = document.createElement("div");
    combinedElement.appendChild(salaryElement.cloneNode(true));
    const pageBreak = document.createElement("div");
    pageBreak.style.pageBreakBefore = "always";
    combinedElement.appendChild(pageBreak);
    combinedElement.appendChild(attendanceElement.cloneNode(true));

    // PDF export options
    const options = {
      filename: `${getMonthName(month)}-${year}-${employee?.name}-Salary.pdf`,
      margin: [0, 0, 10, 0],
      html2canvas: {
        useCORS: true,
        scale: 4,
      },
      jsPDF: {
        orientation: 'portrait',
        format: 'a4',
        unit: 'pt',
      },
    };

    html2pdf().set(options).from(combinedElement).save();
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4>Salary Slip</h4>
          <button className="btn btn-secondary" onClick={() => { setTimeout(() => { exportCombinedAsPdf() }, 1000) }}>Download</button>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="p-5 bg-white mt-2 mb-3" id="exportSalary">
          <div style={{ marginBottom: "2rem" }}>
            <img style={{ width: "150px", height: "30px" }} src={logo} alt="logo" />
          </div>
          <div className="mb-0">
            <h4 className="fw-bold text-dark mb-3">CODE DIFFUSION TECHNOLOGIES</h4>
            <div style={{ borderBottom: "1px solid #aaa" }}></div>
          </div>
          <h5 className="text-center" style={{ marginBottom: "2rem", marginTop: "2rem" }}>Salary Slip ({getMonthName(month)} {year})</h5>
          <div className="row" style={{ border: "1px solid #eee" }}>
            <div className="col-md-6 px-3 py-2">
              <div className="row mb-2">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>Employee Name</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{employee?.name}</div>
              </div>
              <div className="row mb-2">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>Designation</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{employee?.designation?.name}</div>
              </div>
              <div className="row mb-2">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>Department</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{employee?.department?.name}</div>
              </div>
              <div className="row mb-2">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>Date of Joining</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{formatDate(employee?.joining)}</div>
              </div>
              <div className="row">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>Phone Number</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{employee?.mobile}</div>
              </div>
            </div>

            <div className="col-md-6 px-3 py-2" style={{ borderLeft: '1px solid #eee' }}>
              <div className="row mb-2">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>Transaction ID</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{transactionId}</div>
              </div>
              <div className="row mb-2">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>UAN</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{employee?.UAN}</div>
              </div>
              <div className="row mb-2">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>Employee ID</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{employee?.employeeId}</div>
              </div>
              <div className="row mb-2">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>PAN Number</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{employee?.PAN}</div>
              </div>
              <div className="row mb-2">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>Bank Account</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{employee?.bankAccount}</div>
              </div>
              <div className="row">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>Monthly Gross</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>₹{employee?.monthlySalary}</div>
              </div>
            </div>
          </div>

          <h5 className="mt-5 mb-3">Payment & Salary ({getMonthName(month)} {year})</h5>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th className="py-2 ps-3" style={{ border: "0.1px solid #eee" }}>Earnings</th>
                <th className="py-2 ps-3" style={{ border: "0.1px solid #eee" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 ps-3" style={{ border: "0.1px solid #eee" }}>Salary</td>
                <td className="py-2 ps-3" style={{ border: "0.1px solid #eee" }}>₹{totalSalary}</td>
              </tr>
            </tbody>
            <thead>
              <tr>
                <th className="py-2 ps-3" style={{ border: "0.1px solid #eee" }}>Total Earnings</th>
                <th className="py-2 ps-3" style={{ border: "0.1px solid #eee" }}>₹{totalSalary}</th>
              </tr>
            </thead>
          </table>

          <div style={{ border: "1px solid #eee", marginTop: "2rem" }}>
            <div className="d-flex justify-content-between px-3 py-2">
              <div style={{ fontWeight: "600", color: "black" }}>Net Payable (Total Earnings)</div>
              <div style={{ fontWeight: "600", color: "black" }}>₹{totalSalary}</div>
            </div>
            <div className="d-flex justify-content-between px-3 py-2">
              <div style={{ fontWeight: "600", color: "black" }}>{numberToWords(totalSalary)}</div>
            </div>
          </div>

          <h5 className="mt-5 mb-3">Attendance Summary ({getMonthName(month)} {year})</h5>
          <div className="ps-3" style={{ border: "1px solid #eee" }}>
            <div className="row py-2" style={{ color: "black" }}>
              <div className="col-2">Present</div>
              <div className="col-2">Absent</div>
              <div className="col-2">Leave</div>
              <div className="col-2">Comp Off</div>
              <div className="col-2">Weekly Off</div>
              <div className="col-2">Holiday</div>
            </div>
            <div className="row py-2" style={{ color: "black" }}>
              <div className="col-2">{monthlyStatistic?.employeePresentDays}</div>
              <div className="col-2">{monthlyStatistic?.employeeAbsentDays}</div>
              <div className="col-2">{monthlyStatistic?.employeeLeaveDays}</div>
              <div className="col-2">{monthlyStatistic?.employeeCompOffDays}</div>
              <div className="col-2">{monthlyStatistic?.totalSundays}</div>
              <div className="col-2">{monthlyStatistic?.totalHolidays}</div>
            </div>
          </div>
          <p className="text-center mt-5">This is a digitally generated document and does not require a signature or seal.</p>
        </div>

        <div className="p-5 bg-white mt-2 mb-3" id="exportAttendance">
          <div style={{ marginBottom: "2rem" }}>
            <img style={{ width: "150px", height: "30px" }} src={logo} alt="logo" />
          </div>
          <div className="mb-0">
            <h4 className="fw-bold text-dark mb-3">CODE DIFFUSION TECHNOLOGIES</h4>
            <div style={{ borderBottom: "1px solid #aaa", marginBottom: "2rem" }}></div>
          </div>

          <Calender attendanceData={data} month={month} year={year} employeeId={employeeId} />

          <h5 className="mt-5 mb-3">Attendance Summary ({getMonthName(month)} {year})</h5>
          <div className="ps-3" style={{ border: "1px solid #eee" }}>
            <div className="row py-2" style={{ color: "black" }}>
              <div className="col-2">Present</div>
              <div className="col-2">Absent</div>
              <div className="col-2">Leave</div>
              <div className="col-2">Comp Off</div>
              <div className="col-2">Weekly Off</div>
              <div className="col-2">Holiday</div>
            </div>
            <div className="row py-2" style={{ color: "black" }}>
              <div className="col-2">{monthlyStatistic?.employeePresentDays}</div>
              <div className="col-2">{monthlyStatistic?.employeeAbsentDays}</div>
              <div className="col-2">{monthlyStatistic?.employeeLeaveDays}</div>
              <div className="col-2">{monthlyStatistic?.employeeCompOffDays}</div>
              <div className="col-2">{monthlyStatistic?.totalSundays}</div>
              <div className="col-2">{monthlyStatistic?.totalHolidays}</div>
            </div>
          </div>
          <p className="text-center mt-5">This is a digitally generated document and does not require a signature or seal.</p>
        </div>
      </div>
    </div>
  );
};

export default SalarySlip;
