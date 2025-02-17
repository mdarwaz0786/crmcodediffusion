/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { Link, useLocation } from "react-router-dom";
import usericon from "../../Assets/user-icon.png";
import { useAuth } from "../../context/authContext.jsx";
import Search from "./Search.jsx";
import { useEffect, useState } from "react";
import axios from "axios";
import logo from "../../Assets/logo.png";
const base_url = import.meta.env.VITE_API_BASE_URL;

const Header = () => {
  const [total, setTotal] = useState("");
  const { team, isLoggedIn, isLoading, validToken } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const permissions = team?.role?.permissions?.project;

  useEffect(() => {
    const fetchAllProject = async () => {
      try {
        const response = await axios.get(`${base_url}/api/v1/project/all-project`, {
          headers: {
            Authorization: validToken,
          },
        });

        if (response?.data?.success) {
          setTotal(response?.data?.totalCount);
        };
      } catch (error) {
        console.log(error.message);
      };
    };

    if (!isLoading && team && permissions?.access) {
      fetchAllProject();
    };
  }, [isLoading, team, permissions]);

  return (
    <div className="main-wrapper">
      <div className="header">
        {/* Logo */}
        <div className="header-left active">
          <Link to="/" className="logo logo-normal">
            <img src={logo} alt="logo" />
            <img src={logo} className="white-logo" alt="white-logo" />
          </Link>

          <Link to="/" className="logo-small">
            <img src={logo} alt="logo-small" />
          </Link>

          <Link id="toggle_btn" to="#">
            <i className="ti ti-arrow-bar-to-left" />
          </Link>
        </div>
        {/* /Logo */}

        <a id="mobile_btn" className="mobile_btn" href="#sidebar">
          <span className="bar-icon">
            <span />
            <span />
            <span />
          </span>
        </a>

        <div className="header-user">
          <ul className="nav user-menu">
            {/* Search */}
            <li className="nav-item nav-search-inputs me-auto" style={{ visibility: currentPath === "/" ? "visible" : "hidden" }}>
              <div className="top-nav-search">
                <Link to="#" className="responsive-search">
                  <i className="fa fa-search" />
                </Link>
                <div className="dropdown">
                  <div className="searchinputs">
                    <Search />
                  </div>
                </div>
              </div>
            </li>
            {/* /Search */}

            {/* Nav List */}
            <li className="nav-item nav-list">
              <ul className="nav">
                <li className="nav-item dropdown">
                  <Link to="#" className="btn btn-header-list" data-bs-toggle="dropdown">
                    <i className="ti ti-layout-grid-add" />
                  </Link>
                  <div className="dropdown-menu dropdown-menu-end menus-info">
                    <div className="row">
                      <div className="col-md-6">
                        <ul className="menu-list">
                          {
                            (team?.role?.permissions?.project?.create) && (
                              <li>
                                <Link to="/add-project">
                                  <div className="menu-details">
                                    <span className="menu-list-icon bg-violet">
                                      <i className="ti ti-briefcase"></i>
                                    </span>
                                    <div className="menu-details-content">
                                      <p>Add Project</p>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            )
                          }
                          {
                            (team?.role?.permissions?.customer?.create) && (
                              <li>
                                <Link to="/add-client">
                                  <div className="menu-details">
                                    <span className="menu-list-icon bg-green">
                                      <i className="ti ti-user-circle"></i>
                                    </span>
                                    <div className="menu-details-content">
                                      <p>Add Client</p>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            )
                          }
                          {
                            (team?.role?.permissions?.team?.create) && (
                              <li>
                                <Link to="/add-employee">
                                  <div className="menu-details">
                                    <span className="menu-list-icon bg-pink">
                                      <i className="ti ti-user"></i>
                                    </span>
                                    <div className="menu-details-content">
                                      <p>Add Employee</p>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            )
                          }
                          {
                            (team?.role?.permissions?.role?.create) && (
                              <li>
                                <Link to="/add-role">
                                  <div className="menu-details">
                                    <span className="menu-list-icon bg-primary">
                                      <i className="ti ti-shield-check"></i>
                                    </span>
                                    <div className="menu-details-content">
                                      <p>Add Role & Permission</p>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            )
                          }
                          {
                            (team?.role?.permissions?.designation?.create) && (
                              <li>
                                <Link to="/add-designation">
                                  <div className="menu-details">
                                    <span className="menu-list-icon bg-danger">
                                      <i className="ti ti-id-badge"></i>
                                    </span>
                                    <div className="menu-details-content">
                                      <p>Add Designation</p>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            )
                          }
                          {
                            (team?.role?.permissions?.invoice?.create) && (
                              <li>
                                <Link to="/add-invoice">
                                  <div className="menu-details">
                                    <span className="menu-list-icon bg-orange">
                                      <i className="ti ti-receipt" />
                                    </span>
                                    <div className="menu-details-content">
                                      <p>Add Tax Invoice</p>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            )
                          }
                          {
                            (team?.role?.permissions?.purchaseInvoice?.create) && (
                              <li>
                                <Link to="/add-purchase-invoice">
                                  <div className="menu-details">
                                    <span className="menu-list-icon" style={{ background: "#643546" }}>
                                      <i className="ti ti-wallet" />
                                    </span>
                                    <div className="menu-details-content">
                                      <p>Add Purchase Invoice</p>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            )
                          }
                          {
                            (team?.role?.permissions?.technology?.create) && (
                              <li>
                                <Link to="/add-technology">
                                  <div className="menu-details">
                                    <span className="menu-list-icon" style={{ background: "cyan" }}>
                                      <i className="ti ti-code"></i>
                                    </span>
                                    <div className="menu-details-content">
                                      <p>Add Technology</p>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            )
                          }
                          {/* {
                            (team?.role?.permissions?.project?.fields?.workDetail?.show) && (
                              <li>
                                <Link to="/add-work-detail">
                                  <div className="menu-details">
                                    <span className="menu-list-icon" style={{ background: "black" }}>
                                      <i className="ti ti-clipboard"></i>
                                    </span>
                                    <div className="menu-details-content">
                                      <p>Add Work Summary</p>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            )
                          } */}
                        </ul>
                      </div>

                      <div className="col-md-6">
                        <ul className="menu-list">
                          {
                            (team?.role?.permissions?.projectType?.create) && (
                              <li>
                                <Link to="/add-project-type">
                                  <div className="menu-details">
                                    <span className="menu-list-icon bg-purple">
                                      <i className="ti ti-apps"></i>
                                    </span>
                                    <div className="menu-details-content">
                                      <p>Add Project Type</p>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            )
                          }
                          {
                            (team?.role?.permissions?.projectStatus?.create) && (
                              <li>
                                <Link to="/add-project-status">
                                  <div className="menu-details">
                                    <span className="menu-list-icon bg-success">
                                      <i className="ti ti-clipboard-list"></i>
                                    </span>
                                    <div className="menu-details-content">
                                      <p>Add Project Status</p>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            )
                          }
                          {/* {
                            (team?.role?.permissions?.projectTiming?.create) && (
                              <li>
                                <Link to="/add-project-timeline">
                                  <div className="menu-details">
                                    <span className="menu-list-icon" style={{ background: "green" }}>
                                      <i className="ti ti-clock"></i>
                                    </span>
                                    <div className="menu-details-content">
                                      <p>Add Project Timeline</p>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            )
                          } */}
                          {
                            (team?.role?.permissions?.projectPriority?.create) && (
                              <li>
                                <Link to="/add-project-priority">
                                  <div className="menu-details">
                                    <span className="menu-list-icon bg-tertiary">
                                      <i className="ti ti-star"></i>
                                    </span>
                                    <div className="menu-details-content">
                                      <p>Add Project Priority</p>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            )
                          }
                          {
                            (team?.role?.permissions?.projectCategory?.create) && (
                              <li>
                                <Link to="/add-project-category">
                                  <div className="menu-details">
                                    <span className="menu-list-icon bg-info">
                                      <i className="ti ti-tags"></i>
                                    </span>
                                    <div className="menu-details-content">
                                      <p>Add Project Category</p>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            )
                          }
                          {
                            (team?.role?.permissions?.proformaInvoice?.create) && (
                              <li>
                                <Link to="/add-proforma-invoice">
                                  <div className="menu-details">
                                    <span className="menu-list-icon bg-blue">
                                      <i className="ti ti-file-invoice" />
                                    </span>
                                    <div className="menu-details-content">
                                      <p>Add Proforma Invoice</p>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            )
                          }
                          {
                            (team?.role?.permissions?.projectDeployment?.create) && (
                              <li>
                                <Link to="/add-project-deployment">
                                  <div className="menu-details">
                                    <span className="menu-list-icon" style={{ background: "#893465" }}>
                                      <i className="ti ti-cloud-upload"></i>
                                    </span>
                                    <div className="menu-details-content">
                                      <p>Add Project Deployment</p>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            )
                          }
                        </ul>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </li>
            {/* /Nav List */}

            {/* Project Count */}
            <li className="nav-item nav-item-box">
              <Link to="#">
                <i className="ti ti-briefcase"></i>
                <span className="badge rounded-pill">{total}</span>
              </Link>
            </li>
            {/* /Project count */}

            {/* Profile Dropdown */}
            <li className="nav-item dropdown has-arrow main-drop">
              <Link to="#" className="nav-link userset" data-bs-toggle="dropdown">
                <span className="user-info">
                  <span className="user-letter">
                    <img src={usericon} alt="profile" />
                  </span>
                  <span className="badge badge-success rounded-pill" />
                </span>
              </Link>
              <div className="dropdown-menu menu-drop-user">
                <div className="profilename">
                  <Link className="dropdown-item" to="/">
                    <i className="ti ti-layout-2" /> Dashboard
                  </Link>
                  {
                    isLoggedIn ? (
                      <>
                        <Link className="dropdown-item" to="/profile">
                          <i className="ti ti-user" /> {team?.name}
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link className="dropdown-item" to="/login">
                          <i className="ti ti-user" /> Login
                        </Link>
                      </>
                    )
                  }
                  <Link className="dropdown-item" to="/logout">
                    <i className="ti ti-lock" /> Logout
                  </Link>
                </div>
              </div>
            </li>
            {/* /Profile Dropdown */}
          </ul>
        </div>

        {/* Mobile Menu */}
        <div className="dropdown mobile-user-menu">
          <Link to="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="fa fa-ellipsis-v" /></Link>
          <div className="dropdown-menu">
            <Link className="dropdown-item" to="/">
              <i className="ti ti-layout-2" /> Dashboard
            </Link>
            {
              isLoggedIn ? (
                <>
                  <Link className="dropdown-item" to="/profile">
                    <i className="ti ti-user" /> {team?.name}
                  </Link>
                </>
              ) : (
                <>
                  <Link className="dropdown-item" to="/login">
                    <i className="ti ti-user" /> Login
                  </Link>
                </>
              )
            }
            <Link className="dropdown-item" to="/logout">
              <i className="ti ti-lock" /> Logout
            </Link>
          </div>
        </div>
        {/* /Mobile Menu */}
      </div>
    </div>
  );
};

export default Header;