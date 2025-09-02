/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from 'axios';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from "../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const AppSetting = () => {
  const [data, setData] = useState([]);
  const { team, isLoading, validToken } = useAuth();

  const fetchAllData = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/appSetting/all-appSetting`, {
        headers: {
          Authorization: validToken,
        },
      });
      if (response?.data?.success) {
        setData(response?.data?.data);
      };
    } catch (error) {
      console.log(error);
    };
  };

  useEffect(() => {
    if (!isLoading && team && team?.isSuperAdmin) {
      fetchAllData();
    };
  }, [team, isLoading]);

  if (isLoading) {
    return <Preloader />;
  };

  if (!team?.isSuperAdmin) {
    return <Navigate to="/" />;
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="row">
            <div className="col-md-12">
              <div className="page-header">
                <div className="row align-items-center">
                  <div className="col-4">
                    <h4 className="page-title">App Setting</h4>
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

              <div className="card main-card">
                <div className="card-body">
                  <div className="search-section" style={{ display: 'flex', justifyContent: "flex-end" }}>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="export-list text-sm-end">
                          <ul>
                            <li>
                              <Link to="/add-app-setting" className="btn btn-primary">
                                <i className="ti ti-square-rounded-plus" />
                                Add App Setting
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  {
                    data?.length === 0 ? (
                      <h4 style={{ textAlign: 'center' }}>No Data</h4>
                    ) : (
                      <div className="table-responsive custom-table">
                        <table className="table table-bordered table-striped custom-border">
                          <thead className="thead-light">
                            <tr>
                              <th className="no-sort">
                                <label className="checkboxs"><input type="checkbox" id="select-all" /><span className="checkmarks" /></label>
                              </th>
                              <th>#</th>
                              <th>App Name</th>
                              <th>Android Version</th>
                              <th>IOS Version</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {
                              data?.map((d, index) => (
                                <tr key={d?._id}>
                                  <th className="no-sort">
                                    <label className="checkboxs"><input type="checkbox" id="select-all" /><span className="checkmarks" /></label>
                                  </th>
                                  <td>{index + 1}</td>
                                  <td>{d?.appName}</td>
                                  <td>{d?.appVersion}</td>
                                  <td>{d?.iosAppVersion}</td>
                                  <td>
                                    <div className="table-action">
                                      <Link to="#" className="action-icon" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i className="fa fa-ellipsis-v"></i>
                                      </Link>
                                      <div className="dropdown-menu dropdown-menu-right">
                                        <Link to={`/edit-app-setting/${d?._id}`} className="dropdown-item">
                                          <i className="ti ti-edit text-blue"></i>
                                          Update
                                        </Link>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </table>
                      </div>
                    )
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppSetting;