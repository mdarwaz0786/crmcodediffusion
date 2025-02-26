/* eslint-disable no-extra-semi */
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";

const Profile = () => {
  const { team } = useAuth();
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType");

  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Profile</h4>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        {
          userType === "Employee" ? (
            <div className="row">
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="name">Name <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="name" id="name" value={team?.name} disabled />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="role">Role <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="role" id="role" value={team?.role?.name} disabled />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="email">Email ID <span className="text-danger"></span></label>
                  <input type="email" className="form-control" name="email" id="email" value={team?.email} disabled />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="mobile">Mobile No. <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="mobile" id="mobile" value={team?.mobile} disabled />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="designation">Designation <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="designation" id="designation" value={team?.designation?.name} disabled />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="reportingTo">Reporting To <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="reportingTo" id="reportingTo" value={team?.reportingTo?.map((reporting) => reporting?.name).join(", ")} disabled />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="employeeId">Employee ID <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="employeeId" id="employeeId" value={team?.employeeId} disabled />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="password">Password <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="password" id="password" value={team?.password} disabled />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="joining">Joining Date <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="joining" id="joining" value={formatDate(team?.joining)} disabled />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="dob">Date of Birth <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="dob" id="dob" value={formatDate(team?.dob)} disabled />
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="name">Name <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="name" id="name" value={team?.name} disabled />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="role">Role <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="role" id="role" value={team?.role?.name} disabled />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="email">Email ID <span className="text-danger"></span></label>
                  <input type="email" className="form-control" name="email" id="email" value={team?.email} disabled />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="mobile">Mobile No. <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="mobile" id="mobile" value={team?.mobile} disabled />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="password">Password <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="password" id="password" value={team?.password} disabled />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="companyName">Company Name <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="companyName" id="companyName" value={team?.companyName} disabled />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="GSTNumber">GST Number <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="GSTNumber" id="GSTNumber" value={team?.GSTNumber} disabled />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="state">State <span className="text-danger"></span></label>
                  <input type="text" className="form-control" name="state" id="state" value={team?.state} disabled />
                </div>
              </div>
              <div className="col-md-12">
                <div className="form-wrap">
                  <label className="col-form-label" htmlFor="address">Address <span className="text-danger"></span></label>
                  <textarea rows={4} type="text" className="form-control" name="address" id="address" value={team?.address} disabled />
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default Profile;