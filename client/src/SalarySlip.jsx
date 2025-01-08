import logo from "./Assets/logo.png";

const SalarySlip = () => {
  const salaryData = {
    companyName: 'CODE DIFFUSION TECHNOLOGIES',
    employeeName: 'Md Arwaz',
    designation: 'Full Stack Developer',
    department: 'IT',
    dateOfJoining: '27 Jue, 2022',
    phoneNumber: '8340723693',
    uan: '728446668934',
    empID: 'EmpID001',
    panNumber: 'PTXPK5337K',
    accountNumber: '0123456789012345',
    monthlyGross: 12000,
  };

  return (
    <div className="page-wrapper">
      <div className="content" id="exportAttendanceList">
        <div className="p-5 bg-white mt-2 mb-3">
          <div style={{ marginBottom: "2rem" }}>
            <img style={{ width: "150px", height: "30px" }} src={logo} alt="logo" />
          </div>
          <div className="mb-0">
            <h4 className="fw-bold text-dark mb-3">{salaryData.companyName}</h4>
            <div style={{ borderBottom: "1px solid #aaa" }}></div>
          </div>

          <h5 className="text-center" style={{ marginBottom: "2rem", marginTop: "2rem" }}>Salary Slip (May 2024)</h5>
          <div className="row" style={{ border: "1px solid #eee" }}>
            <div className="col-md-6 px-3 py-2">
              <div className="row mb-2">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>Employee Name</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{salaryData.employeeName}</div>
              </div>
              <div className="row mb-2">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>Designation</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{salaryData.designation}</div>
              </div>
              <div className="row mb-2">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>Department</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{salaryData.department}</div>
              </div>
              <div className="row mb-2">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>Date of Joining</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{salaryData.dateOfJoining}</div>
              </div>
              <div className="row">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>Phone Number</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{salaryData.phoneNumber}</div>
              </div>
            </div>

            <div className="col-md-6 px-3 py-2" style={{ borderLeft: '1px solid #eee' }}>
              <div className="row mb-2">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>UAN</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{salaryData.uan}</div>
              </div>
              <div className="row mb-2">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>Employee ID</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{salaryData.empID}</div>
              </div>
              <div className="row mb-2">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>PAN Number</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{salaryData.panNumber}</div>
              </div>
              <div className="row mb-2">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>Bank Account</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>{salaryData.accountNumber}</div>
              </div>
              <div className="row">
                <div className="col-5" style={{ fontWeight: "500", color: "black" }}>Monthly Gross</div>
                <div className="col-7" style={{ fontWeight: "400", color: "black" }}>₹{salaryData.monthlyGross}</div>
              </div>
            </div>
          </div>

          <h5 className="mt-5 mb-3">Payment & Salary (May 2024)</h5>
          <table className="table table-bordered">
            <thead>
              <tr style={{ border: "1px solid #eee" }}>
                <th className="py-2 ps-3">Earnings</th>
                <th className="py-2 ps-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ border: "none", borderColor: "#eee" }}>
                <td className="py-2 ps-3" style={{ color: "black" }}>Present</td>
                <td className="py-2 ps-3" style={{ color: "black" }}>₹12000.00</td>
              </tr>
              <tr style={{ border: "none", borderColor: "#eee" }}>
                <td className="py-2 ps-3" style={{ color: "black" }}>Holiday</td>
                <td className="py-2 ps-3" style={{ color: "black" }}>₹12000.00</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: "600", border: "1px solid #eee" }}>
                <td className="py-2 ps-3" style={{ fontSize: "15px" }}>Total Earnings</td>
                <td className="py-2 ps-3" style={{ fontSize: "15px" }}>₹12000.00</td>
              </tr>
            </tfoot>
          </table>

          <div style={{ border: "1px solid #eee", marginTop: "2rem" }}>
            <div className="d-flex justify-content-between px-3 py-2">
              <div style={{ fontWeight: "500", color: "black" }}>Previous Month Closing Balance</div>
              <div style={{ fontWeight: "400", color: "black" }}>₹0.00</div>
            </div>
            <div className="d-flex justify-content-between px-3 py-2">
              <div style={{ fontWeight: "600", color: "black" }}>Net Payable (Earnings + Previous Balance)</div>
              <div style={{ fontWeight: "600", color: "black" }}>₹12000.00</div>
            </div>
            <div className="d-flex justify-content-between px-3 py-2">
              <div style={{ fontWeight: "600", color: "black" }}>Twelve Thousand Only</div>
            </div>
          </div>

          <h5 className="mt-5 mb-3">Attendance Summary (May 2024)</h5>
          <div className="ps-3" style={{ border: "1px solid #eee" }}>
            <div className="row py-2" style={{ color: "black" }}>
              <div className="col-2">Present</div>
              <div className="col-2">Absent</div>
              <div className="col-2">Weekly Off</div>
              <div className="col-2">Holiday</div>
              <div className="col-2">Leave</div>
            </div>
            <div className="row py-2" style={{ color: "black" }}>
              <div className="col-2">25</div>
              <div className="col-2">2</div>
              <div className="col-2">4</div>
              <div className="col-2">1</div>
              <div className="col-2">0</div>
            </div>
          </div>
          <p className="text-center mt-5">Downloaded at 01 June 2024 01:25 PM. This is a digitally generated document and does not require a signature or seal.</p>
        </div>
      </div>
    </div>
  );
};

export default SalarySlip;
