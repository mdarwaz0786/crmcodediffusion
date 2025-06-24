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
import formatDate from "../../Helper/formatDate.js";
const base_url = import.meta.env.VITE_API_BASE_URL;

const SalarySlip = () => {
  const navigate = useNavigate();
  const { employeeId, month, year } = useParams();
  const { validToken, team, isLoading } = useAuth("");
  const [employee, setEmployee] = useState("");
  const [monthlyStatics, setMonthlyStatics] = useState("");
  const [salary, setSalary] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.log("Error while fetching single employee:", error.message);
    };
  };

  const fetchSalary = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/v1/salary/monthly-salary`, {
        headers: {
          Authorization: validToken,
        },
        params: {
          month: `${year}-${month}`,
        },
      });

      if (response?.data?.success) {
        const data = response?.data?.salaryData;
        const filteredData = data?.filter((salary) => salary?.employeeId === employeeId);
        setSalary(filteredData);
      };
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    };
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/v1/newAttendance/monthly-newStatistic`, {
        headers: {
          Authorization: validToken,
        },
        params: {
          month: `${year}-${month}`,
          employeeId,
        },
      });
      if (response?.data?.success) {
        setAttendance(response?.data?.calendarData);
        setMonthlyStatics(response?.data?.monthlyStatics);
      };
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    };
  };

  useEffect(() => {
    if (employeeId && validToken && month && year && !isLoading && (team?.role?.name?.toLowerCase() === "admin" || team?.role?.name?.toLowerCase() === "hr")) {
      fetchEmployee(employeeId);
      fetchAttendance();
      fetchSalary();
    };
  }, [employeeId, validToken, team, isLoading, month, year]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  function getMonthName(monthNumber) {
    if (!monthNumber) {
      return;
    };

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
      margin: [10, 0, 10, 0],
      html2canvas: {
        useCORS: true,
        scale: 2,
      },
      jsPDF: {
        orientation: 'portrait',
        format: [1000, 800],
        unit: 'pt',
      },
    };

    html2pdf().set(options).from(combinedElement).save();
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        {
          loading ? (
            <h4 style={{ textAlign: "center", marginTop: "1rem" }}>Making Salary slip, please wait...</h4>
          ) : (
            <>
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
                  <h4 className="fw-bold text-dark mb-2" style={{ color: "black" }}>CODE DIFFUSION TECHNOLOGIES</h4>
                  <div style={{ borderBottom: "1px solid #aaa" }}></div>
                </div>

                <h5 className="text-center" style={{ marginBottom: "2rem", marginTop: "2rem", color: "black" }}>Salary Slip ({getMonthName(month)} {year})</h5>
                <div className="row" style={{ border: "1px solid #eee", marginLeft: "0rem", marginRight: "0rem" }}>
                  <div className="col-md-6 px-3 py-2">
                    <div className="row mb-2">
                      <div className="col-5" style={{ fontWeight: "600", color: "black" }}>Employee Name</div>
                      <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{employee?.name}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-5" style={{ fontWeight: "600", color: "black" }}>Designation</div>
                      <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{employee?.designation?.name}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-5" style={{ fontWeight: "600", color: "black" }}>Department</div>
                      <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{employee?.department?.name}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-5" style={{ fontWeight: "600", color: "black" }}>Date of Joining</div>
                      <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{formatDate(employee?.joining)}</div>
                    </div>
                  </div>

                  <div className="col-md-6 px-3 py-2" style={{ borderLeft: '1px solid #eee' }}>
                    <div className="row mb-2">
                      <div className="col-5" style={{ fontWeight: "600", color: "black" }}>Mobile Number</div>
                      <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{employee?.mobile}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-5" style={{ fontWeight: "600", color: "black" }}>Employee ID</div>
                      <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{employee?.employeeId}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-5" style={{ fontWeight: "600", color: "black" }}>Monthly Gross Salary</div>
                      <div className="col-7" style={{ fontWeight: "400", color: "black" }}>₹{employee?.monthlySalary}</div>
                    </div>
                  </div>
                </div>

                <h5 className="mt-5 mb-2" style={{ color: "black" }}>Payment & Salary ({getMonthName(month)} {year})</h5>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th className="py-2 ps-3" style={{ border: "0.1px solid #eee" }}>Description</th>
                      <th className="py-2 ps-3" style={{ border: "0.1px solid #eee" }}> Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 ps-3" style={{ border: "0.1px solid #eee", color: "black" }}>Monthly Gross Salary</td>
                      <td className="py-2 ps-3" style={{ border: "0.1px solid #eee", color: "black" }}> ₹{employee?.monthlySalary}</td>
                    </tr>
                    {
                      salary[0]?.totalOnLeave > 0 && (
                        <tr>
                          <td className="py-2 ps-3" style={{ border: "0.1px solid #eee", color: "black" }}>Paid Leaves ({salary[0]?.totalOnLeave} × ₹{salary[0]?.dailySalary})</td>
                          <td className="py-2 ps-3" style={{ border: "0.1px solid #eee", color: "black" }}>+₹{salary[0]?.dailySalary * salary[0]?.totalOnLeave}</td>
                        </tr>
                      )
                    }
                    {
                      salary[0]?.totalCompOff > 0 && (
                        <tr>
                          <td className="py-2 ps-3" style={{ border: "0.1px solid #eee", color: "black" }}>Comp Off ({salary[0]?.totalCompOff} × ₹{salary[0]?.dailySalary})</td>
                          <td className="py-2 ps-3" style={{ border: "0.1px solid #eee", color: "black" }}>+₹{salary[0]?.dailySalary * salary[0]?.totalCompOff}</td>
                        </tr>
                      )
                    }
                    <tr>
                      <td className="py-2 ps-3" style={{ border: "0.1px solid #eee", color: "black" }}>Total Deduction ({salary[0]?.deductionDays} × ₹{salary[0]?.dailySalary})</td>
                      <td className="py-2 ps-3" style={{ border: "0.1px solid #eee", color: "black" }}>-₹{salary[0]?.totalDeduction}</td>
                    </tr>
                  </tbody>
                  <thead>
                    <tr>
                      <th className="py-2 ps-3" style={{ border: "0.1px solid #eee" }}>Net Salary</th>
                      <th className="py-2 ps-3" style={{ border: "0.1px solid #eee" }}> ₹{salary[0]?.totalSalary}</th>
                    </tr>
                  </thead>
                </table>

                <div style={{ border: "1px solid #eee", marginTop: "2rem" }}>
                  <div className="d-flex justify-content-between px-3 mb-2 mt-2">
                    <div style={{ fontWeight: "600", color: "black" }}>Net Payable (Net Salary)</div>
                    <div style={{ fontWeight: "600", color: "black" }}>₹{salary[0]?.totalSalary}</div>
                  </div>
                  <div className="d-flex justify-content-between px-3 mb-2">
                    <div style={{ fontWeight: "600", color: "black" }}>Amount in Words</div>
                    <div style={{ fontWeight: "600", color: "black" }}>{numberToWords(salary[0]?.totalSalary)}</div>
                  </div>
                </div>

                <h5 className="mt-5 mb-2" style={{ color: "black" }}>Salary Deduction Calculation ({getMonthName(month)} {year})</h5>
                <div className="ps-3" style={{ border: "1px solid #eee" }}>
                  <div className="row mb-2 mt-2 text-center" style={{ color: "black", fontWeight: "600" }}>
                    <div className="col">Required Working Hours</div>
                    <div className="col">Worked Hours</div>
                    <div className="col">Shortfall Hours</div>
                    <div className="col">Deduction Days</div>
                    <div className="col">Amount Deducted</div>
                  </div>
                  <div className="row mb-2 text-center" style={{ color: "black" }}>
                    <div className="col">{salary[0]?.companyWorkingHours}</div>
                    <div className="col">{salary[0]?.employeeHoursWorked}</div>
                    <div className="col">{salary[0]?.employeeHoursShortfall}</div>
                    <div className="col">{salary[0]?.employeeHoursShortfall} / {employee?.workingHoursPerDay} = {salary[0]?.deductionDays}</div>
                    <div className="col">{salary[0]?.deductionDays} × ₹{salary[0]?.dailySalary} = ₹{salary[0]?.totalDeduction}</div>
                  </div>
                </div>

                <h5 className="mt-5 mb-2" style={{ color: "black" }}>Attendance Summary ({getMonthName(month)} {year})</h5>
                <div style={{ border: "1px solid #eee" }}>
                  <div className="row mb-2 mt-2 text-center" style={{ color: "black", fontWeight: "600" }}>
                    <div className="col">Present</div>
                    <div className="col">Absent</div>
                    <div className="col">Half Day</div>
                    <div className="col">Leave</div>
                    <div className="col">Comp Off</div>
                    <div className="col">Weekly Off</div>
                    <div className="col">Holiday</div>
                  </div>
                  <div className="row mb-2 text-center" style={{ color: "black" }}>
                    <div className="col">{monthlyStatics?.employeePresentDays}</div>
                    <div className="col">{monthlyStatics?.employeeAbsentDays}</div>
                    <div className="col">{monthlyStatics?.employeeHalfDays}</div>
                    <div className="col">{monthlyStatics?.employeeLeaveDays}</div>
                    <div className="col">{monthlyStatics?.employeeCompOffDays}</div>
                    <div className="col">{monthlyStatics?.totalSundays}</div>
                    <div className="col">{monthlyStatics?.totalHolidays}</div>
                  </div>
                </div>
                <p className="text-center mt-5" style={{ color: "black" }}>This is a digitally generated document and does not require a signature or seal.</p>
              </div>

              <div className="p-5 bg-white mt-2 mb-3" id="exportAttendance">
                <div style={{ marginBottom: "2rem" }}>
                  <img style={{ width: "150px", height: "30px" }} src={logo} alt="logo" />
                </div>
                <div className="mb-0">
                  <h4 className="fw-bold text-dark mb-2" style={{ color: "black" }}>CODE DIFFUSION TECHNOLOGIES</h4>
                  <div style={{ borderBottom: "1px solid #aaa", marginBottom: "0rem" }}></div>
                </div>

                <h5 className="mt-5 mb-2" style={{ color: "black" }}>Attendance ({getMonthName(month)} {year})</h5>
                <Calender attendanceData={attendance} month={month} year={year} employeeId={employeeId} />

                <h5 className="mt-5 mb-2" style={{ color: "black" }}>Attendance Summary ({getMonthName(month)} {year})</h5>
                <div style={{ border: "1px solid #eee" }}>
                  <div className="row mb-2 mt-2 text-center" style={{ color: "black", fontWeight: "600" }}>
                    <div className="col">Present</div>
                    <div className="col">Absent</div>
                    <div className="col">Half Day</div>
                    <div className="col">Leave</div>
                    <div className="col">Comp Off</div>
                    <div className="col">Weekly Off</div>
                    <div className="col">Holiday</div>
                  </div>
                  <div className="row mb-2 text-center" style={{ color: "black" }}>
                    <div className="col">{monthlyStatics?.employeePresentDays}</div>
                    <div className="col">{monthlyStatics?.employeeAbsentDays}</div>
                    <div className="col">{monthlyStatics?.employeeHalfDays}</div>
                    <div className="col">{monthlyStatics?.employeeLeaveDays}</div>
                    <div className="col">{monthlyStatics?.employeeCompOffDays}</div>
                    <div className="col">{monthlyStatics?.totalSundays}</div>
                    <div className="col">{monthlyStatics?.totalHolidays}</div>
                  </div>
                </div>

                <h5 className="mt-5 mb-2" style={{ color: "black" }}>Working Hours Summary ({getMonthName(month)} {year})</h5>
                <div style={{ border: "1px solid #eee" }}>
                  <div className="row mb-2 mt-2 text-center" style={{ color: "black", fontWeight: "600" }}>
                    <div className="col">Total Working Days</div>
                    <div className="col">Required Working Hours</div>
                    <div className="col">Worked Hours</div>
                    <div className="col">Shortfall Hours</div>
                  </div>
                  <div className="row mb-2 text-center" style={{ color: "black" }}>
                    <div className="col">{salary[0]?.companyWorkingDays} Days</div>
                    <div className="col">{salary[0]?.companyWorkingHours}</div>
                    <div className="col">{salary[0]?.employeeHoursWorked}</div>
                    <div className="col">{salary[0]?.employeeHoursShortfall}</div>
                  </div>
                </div>
                <p className="text-center mt-5" style={{ color: "black" }}>This is a digitally generated document and does not require a signature or seal.</p>
              </div>
            </>
          )
        }
      </div>
    </div>
  );
};

export default SalarySlip;
