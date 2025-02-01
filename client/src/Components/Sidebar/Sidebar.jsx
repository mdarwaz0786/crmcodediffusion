/* eslint-disable no-extra-semi */
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";
import usericon from "../../Assets/user-icon.png";
import { useState } from "react";

const Sidebar = () => {
  const { team, isLoggedIn } = useAuth();
  const permissions = team?.role?.permissions;
  const [active, setActive] = useState(null);
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobile = window.innerWidth <= 991;

  const handleActive = (element) => {
    setActive(element);
  };

  return (
    <div className="main-wrapper">
      <div className="sidebar" id="sidebar">
        <div className="sidebar-inner slimscroll">
          <div id="sidebar-menu" className="sidebar-menu">
            <ul>
              <li className="clinicdropdown">
                <Link to="#">
                  <img src={usericon} className="img-fluid" alt="Profile" />
                  <div className="user-names">
                    {
                      isLoggedIn ? (
                        <>
                          <h5>{team?.name}</h5>
                          <h6>{team?.role?.name}</h6>
                        </>
                      ) : (
                        <>
                          <h5><Link to="/login">Login</Link></h5>
                        </>
                      )
                    }
                  </div>
                </Link>
              </li>
            </ul>

            <ul>
              <li>
                <h6 className="submenu-hdr">Main Menu</h6>
                <ul>
                  <li><Link to="/" className={currentPath === "/" ? "active" : ""} id={isMobile && active === "dashboard" ? "mobile_btn" : ""} onClick={() => handleActive("dashboard")}><i className="ti ti-layout-2" style={{ color: currentPath === "/" ? "" : "#FFA201" }} /><span>Dashboard</span></Link></li>
                </ul>
              </li>
              <li>
                {
                  (permissions?.project?.access ||
                    permissions?.project?.fields?.payment?.show ||
                    permissions?.projectDeployment?.access) && (
                    <h6 className="submenu-hdr">Project</h6>
                  )
                }
                <ul>
                  {
                    (permissions?.project?.access) && (
                      <li><Link to="/project" className={currentPath === "/project" ? "active" : ""} id={isMobile && active === "projects" ? "mobile_btn" : ""} onClick={() => handleActive("projects")}><i style={{ color: currentPath === "/project" ? "" : "#FFA201" }} className="ti ti-briefcase"></i><span>Projects</span></Link></li>
                    )
                  }
                  {
                    (permissions?.projectDeployment?.access) && (
                      <li><Link to="/project-deployment" className={currentPath === "/project-deployment" ? "active" : ""} id={isMobile && active === "projectDeployment" ? "mobile_btn" : ""} onClick={() => handleActive("projectDeployment")}><i style={{ color: currentPath === "/project-deployment" ? "" : "#FFA201" }} className="ti ti-cloud-upload"></i><span>Project Deployment</span></Link></li>
                    )
                  }
                </ul>
              </li>

              <li>
                {
                  (permissions?.invoice?.access ||
                    permissions?.proformaInvoice?.access ||
                    permissions?.purchaseInvoice?.access
                  ) && (
                    <h6 className="submenu-hdr">INVOICE</h6>
                  )
                }
                <ul>
                  <li className="submenu">
                    <Link to="#" className={currentPath === "/invoice" || currentPath === "/proforma-invoice" ? "active subdrop" : ""}>
                      {
                        (permissions?.invoice?.access || permissions?.proformaInvoice?.access) && (
                          <>
                            <i className="ti ti-receipt" style={{ color: currentPath === "/invoice" || currentPath === "/proforma-invoice" ? "" : "#FFA201" }} /><span>Invoice</span><span className="menu-arrow" />
                          </>
                        )
                      }
                    </Link>
                    <ul>
                      {
                        (permissions?.invoice?.access) && (
                          <li><Link to="/invoice" className={currentPath === "/invoice" ? "active" : ""} id={isMobile && active === "invoice" ? "mobile_btn" : ""} onClick={() => handleActive("invoice")}>Tax Invoice</Link></li>
                        )
                      }
                      {
                        (permissions?.proformaInvoice?.access) && (
                          <li><Link to="/proforma-invoice" className={currentPath === "/proforma-invoice" ? "active" : ""} id={isMobile && active === "proformaInvoice" ? "mobile_btn" : ""} onClick={() => handleActive("proformaInvoice")}>Proforma Invoice</Link></li>
                        )
                      }
                    </ul>
                  </li>
                  {
                    (permissions?.purchaseInvoice?.access) && (
                      <li><Link to="/purchase-invoice" className={currentPath === "/purchase-invoice" ? "active" : ""} id={isMobile && active === "purchaseInvoice" ? "mobile_btn" : ""} onClick={() => handleActive("purchaseInvoice")}><i style={{ color: currentPath === "/purchase-invoice" ? "" : "#FFA201" }} className="ti ti-wallet"></i><span>Purchase Invoice</span></Link></li>
                    )
                  }
                </ul>
              </li>

              <li>
                {
                  (permissions?.customer?.access ||
                    team?.role?.name.toLowerCase() === "admin" ||
                    team?.role?.name.toLowerCase() === "hr"
                  ) && (
                    <h6 className="submenu-hdr">Client</h6>
                  )
                }
                <ul>
                  {
                    (permissions?.customer?.access) && (
                      <li><Link to="/client" className={currentPath === "/client" ? "active" : ""} id={isMobile && active === "client" ? "mobile_btn" : ""} onClick={() => handleActive("client")}><i style={{ color: currentPath === "/client" ? "" : "#FFA201" }} className="ti ti-user-circle"></i><span>Client</span></Link></li>
                    )
                  }
                  {
                    (team?.role?.name.toLowerCase() === "admin") && (
                      <li><Link to="/add-on-service" className={currentPath === "/add-on-service" ? "active" : ""} id={isMobile && active === "addOnService" ? "mobile_btn" : ""} onClick={() => handleActive("addOnService")}><i style={{ color: currentPath === "/add-on-service" ? "" : "#FFA201" }} className="ti ti-layers-union"></i><span>Add On Service</span></Link></li>
                    )
                  }
                </ul>
              </li>

              <li>
                {
                  (permissions?.team?.access ||
                    permissions?.attendance?.access ||
                    permissions?.project?.fields?.workDetail?.show ||
                    team?.role?.name.toLowerCase() === "admin" ||
                    team?.role?.name.toLowerCase() === "hr"
                  ) && (
                    <h6 className="submenu-hdr">EMPLOYEE</h6>
                  )
                }
                <ul>
                  {
                    (permissions?.team?.access) && (
                      <li><Link to="/employee" className={currentPath === "/employee" ? "active" : ""} id={isMobile && active === "employee" ? "mobile_btn" : ""} onClick={() => handleActive("employee")}><i style={{ color: currentPath === "/employee" ? "" : "#FFA201" }} className="ti ti-user"></i><span>Employee</span></Link></li>
                    )
                  }
                  {
                    (team?.role?.name?.toLowerCase() === "admin" || team?.role?.name?.toLowerCase() === "hr") && (
                      <li><Link to="/attendance" className={currentPath === "/attendance" ? "active" : ""} id={isMobile && active === "attendance" ? "mobile_btn" : ""} onClick={() => handleActive("attendance")}><i style={{ color: currentPath === "/attendance" ? "" : "#FFA201" }} className="ti ti-checklist"></i><span>Attendance</span></Link></li>
                    )
                  }
                  {
                    (team?.role?.name.toLowerCase() === "admin" || team?.role?.name.toLowerCase() === "hr") && (
                      <li><Link to="/salary" className={currentPath === "/salary" ? "active" : ""} id={isMobile && active === "salary" ? "mobile_btn" : ""} onClick={() => handleActive("salary")}><i style={{ color: currentPath === "/salary" ? "" : "#FFA201" }} className="ti ti-wallet"></i><span>Salary</span></Link></li>
                    )
                  }
                  {
                    (team?.role?.name.toLowerCase() === "admin" || team?.role?.name.toLowerCase() === "hr") && (
                      <li><Link to="/send-notification" className={currentPath === "/send-notification" ? "active" : ""} id={isMobile && active === "sendNotification" ? "mobile_btn" : ""} onClick={() => handleActive("sendNotification")}><i style={{ color: currentPath === "/send-notification" ? "" : "#FFA201" }} className="ti ti-bell"></i><span>Send Notification</span></Link></li>
                    )
                  }
                  {
                    (team?.role?.name?.toLowerCase() === "admin" || team?.role?.name?.toLowerCase() === "hr") && (
                      <li><Link to="/holiday" className={currentPath === "/holiday" ? "active" : ""} id={isMobile && active === "holiday" ? "mobile_btn" : ""} onClick={() => handleActive("holiday")}><i style={{ color: currentPath === "/holiday" ? "" : "#FFA201" }} className="ti ti-sun"></i><span>Holiday</span></Link></li>
                    )
                  }
                  {
                    (team?.role?.name?.toLowerCase() === "admin" || team?.role?.name?.toLowerCase() === "hr") && (
                      <li><Link to="/work-detail" className={currentPath === "/work-detail" ? "active" : ""} id={isMobile && active === "workDetail" ? "mobile_btn" : ""} onClick={() => handleActive("workDetail")}><i style={{ color: currentPath === "/work-detail" ? "" : "#FFA201" }} className="ti ti-clipboard"></i><span>Work Summary</span></Link></li>
                    )
                  }
                  {
                    (team?.role?.name?.toLowerCase() === "admin" || team?.role?.name?.toLowerCase() === "hr") && (
                      <li><Link to="/leave-request" className={currentPath === "/leave-request" ? "active" : ""} id={isMobile && active === "leave-request" ? "mobile_btn" : ""} onClick={() => handleActive("leaveRequest")}><i style={{ color: currentPath === "/leave-request" ? "" : "#FFA201" }} className="ti ti-user-check"></i><span>Leave Request</span></Link></li>
                    )
                  }
                  {
                    (team?.role?.name?.toLowerCase() === "admin" || team?.role?.name?.toLowerCase() === "hr") && (
                      <li><Link to="/missed-punch-out" className={currentPath === "/missed-punch-out" ? "active" : ""} id={isMobile && active === "missedPunchOut" ? "mobile_btn" : ""} onClick={() => handleActive("missedPunchOut")}><i style={{ color: currentPath === "/missed-punch-out" ? "" : "#FFA201" }} className="ti ti-clock-exclamation"></i><span>Missed Punch Out</span></Link></li>
                    )
                  }
                  {
                    (team?.role?.name?.toLowerCase() === "admin" || team?.role?.name?.toLowerCase() === "hr") && (
                      <li><Link to="/late-punch-in" className={currentPath === "/late-punch-in" ? "active" : ""} id={isMobile && active === "latePunchIn" ? "mobile_btn" : ""} onClick={() => handleActive("latePunchIn")}><i style={{ color: currentPath === "/late-punch-in" ? "" : "#FFA201" }} className="ti ti-clock-hour-3"></i><span>Late Punch In</span></Link></li>
                    )
                  }
                  {
                    (team?.role?.name?.toLowerCase() === "admin" || team?.role?.name?.toLowerCase() === "hr") && (
                      <li><Link to="/comp-off" className={currentPath === "/comp-off" ? "active" : ""} id={isMobile && active === "CompOff" ? "mobile_btn" : ""} onClick={() => handleActive("CompOff")}><i style={{ color: currentPath === "/comp-off" ? "" : "#FFA201" }} className="ti ti-user-plus"></i><span>Comp Off</span></Link></li>
                    )
                  }
                </ul>
              </li>

              <li>
                {
                  (
                    permissions?.role?.access ||
                    permissions?.designation?.access ||
                    permissions?.department?.access ||
                    permissions?.technology?.access ||
                    permissions?.projectType?.access ||
                    permissions?.projectStatus?.access ||
                    permissions?.projectCategory?.access ||
                    permissions?.projectTiming?.access ||
                    permissions?.projectPriority?.access) && (
                    <h6 className="submenu-hdr">Master</h6>
                  )
                }
                <ul>
                  {
                    (permissions?.role?.access) && (
                      <li><Link to="/role" className={currentPath === "/role" ? "active" : ""} id={isMobile && active === "role" ? "mobile_btn" : ""} onClick={() => handleActive("role")}><i style={{ color: currentPath === "/role" ? "" : "#FFA201" }} className="ti ti-shield-check"></i><span>Role & Permission</span></Link></li>
                    )
                  }
                  {
                    (permissions?.designation?.access) && (
                      <li><Link to="/designation" className={currentPath === "/designation" ? "active" : ""} id={isMobile && active === "designation" ? "mobile_btn" : ""} onClick={() => handleActive("designation")}><i style={{ color: currentPath === "/designation" ? "" : "#FFA201" }} className="ti ti-id-badge"></i><span>Designation</span></Link></li>
                    )
                  }
                  {
                    (permissions?.department?.access) && (
                      <li><Link to="/department" className={currentPath === "/department" ? "active" : ""} id={isMobile && active === "department" ? "mobile_btn" : ""} onClick={() => handleActive("department")}><i style={{ color: currentPath === "/department" ? "" : "#FFA201" }} className="ti ti-building"></i><span>Department</span></Link></li>
                    )
                  }
                  {
                    (permissions?.technology?.access) && (
                      <li><Link to="/technology" className={currentPath === "/technology" ? "active" : ""} id={isMobile && active === "technology" ? "mobile_btn" : ""} onClick={() => handleActive("technology")}><i style={{ color: currentPath === "/technology" ? "" : "#FFA201" }} className="ti ti-code"></i><span>Technology</span></Link></li>
                    )
                  }
                  {
                    (team?.role?.name.toLowerCase() === "admin") && (
                      <li><Link to="/service" className={currentPath === "/service" ? "active" : ""} id={isMobile && active === "service" ? "mobile_btn" : ""} onClick={() => handleActive("service")}><i style={{ color: currentPath === "/service" ? "" : "#FFA201" }} className="ti ti-briefcase"></i><span>Service</span></Link></li>
                    )
                  }
                  {
                    (permissions?.projectType?.access) && (
                      <li><Link to="/project-type" className={currentPath === "/project-type" ? "active" : ""} id={isMobile && active === "projectType" ? "mobile_btn" : ""} onClick={() => handleActive("projectType")}><i style={{ color: currentPath === "/project-type" ? "" : "#FFA201" }} className="ti ti-apps"></i><span>Project Type</span></Link></li>
                    )
                  }
                  {
                    (permissions?.projectStatus?.access) && (
                      <li><Link to="/project-status" className={currentPath === "/project-status" ? "active" : ""} id={isMobile && active === "projectStatus" ? "mobile_btn" : ""} onClick={() => handleActive("projectStatus")}><i style={{ color: currentPath === "/project-status" ? "" : "#FFA201" }} className="ti ti-clipboard-list"></i><span>Project Status</span></Link></li>
                    )
                  }
                  {
                    (permissions?.projectCategory?.access) && (
                      <li><Link to="/project-category" className={currentPath === "/project-category" ? "active" : ""} id={isMobile && active === "projectCategory" ? "mobile_btn" : ""} onClick={() => handleActive("projectCategory")}><i style={{ color: currentPath === "/project-category" ? "" : "#FFA201" }} className="ti ti-tags"></i><span>Project Category</span></Link></li>
                    )
                  }
                  {
                    (permissions?.projectTiming?.access) && (
                      <li><Link to="/project-timeline" className={currentPath === "/project-timeline" ? "active" : ""} id={isMobile && active === "projectTimeline" ? "mobile_btn" : ""} onClick={() => handleActive("projectTimeline")}><i style={{ color: currentPath === "/project-timeline" ? "" : "#FFA201" }} className="ti ti-clock"></i><span>Project Timeline</span></Link></li>
                    )
                  }
                  {
                    (permissions?.projectPriority?.access) && (
                      <li><Link to="/project-priority" className={currentPath === "/project-priority" ? "active" : ""} id={isMobile && active === "projectPriority" ? "mobile_btn" : ""} onClick={() => handleActive("projectPriority")}><i style={{ color: currentPath === "/project-priority" ? "" : "#FFA201" }} className="ti ti-star"></i><span>Project Priority</span></Link></li>
                    )
                  }
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;