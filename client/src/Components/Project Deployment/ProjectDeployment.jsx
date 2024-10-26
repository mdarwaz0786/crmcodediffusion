/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from "../../context/authContext.jsx";
import html2pdf from "html2pdf.js";
import * as XLSX from 'xlsx';
import { Modal, Button, Card } from 'react-bootstrap';
import Preloader from "../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const ProjectDeployment = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [client, setClient] = useState("");
  const [isInfoOpen, setInfoIsOpen] = useState(false);
  const [id, setId] = useState("");
  const [deploymentData, setDeploymentData] = useState("");
  const [data, setData] = useState([]);
  const [total, setTotal] = useState("");
  const [loading, setLoading] = useState(true);
  const { validToken, team, isLoading } = useAuth();
  const [nameData, setNameData] = useState([]);
  const [name, setName] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    nameFilter: [],
    sort: "Descending",
    page: 1,
    limit: 10,
  });
  const permissions = team?.role?.permissions?.projectDeployment;
  const filedPermissions = team?.role?.permissions?.projectDeployment?.fields;

  const openModal = (clientId) => {
    setIsOpen(true);
    setClientId(clientId);
  };

  const closeModal = () => {
    setIsOpen(false);
    setClientId("");
    setClient("");
  };

  const openInfoModal = (id) => {
    setInfoIsOpen(true);
    setId(id);
  };

  const closeInfoModal = () => {
    setInfoIsOpen(false);
    setId("");
    setDeploymentData("");
  };

  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    const timer = useRef();

    useEffect(() => {
      if (value === "") {
        setDebouncedValue("");
        return;
      };

      timer.current = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(timer.current);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedSearch = useDebounce(filters.search, 500);
  const debouncedSearchName = useDebounce(name, 500);

  const fetchAllProjectDeploymentData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/v1/projectDeployment/all-projectDeployment`, {
        headers: {
          Authorization: validToken,
        },
        params: {
          search: filters.search,
          sort: filters.sort,
          page: filters.page,
          limit: filters.limit,
          nameFilter: filters.nameFilter.map(String),
        },
      });

      if (response?.data?.success) {
        setData(response?.data?.projectDeployment);
        setTotal(response?.data?.totalCount);
        setLoading(false);
      };
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    };
  };

  const fetchAllProjectDeploymentName = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/projectDeployment/all-projectDeployment`, {
        headers: {
          Authorization: validToken,
        },
        params: {
          name,
        },
      });

      if (response?.data?.success) {
        setNameData(response?.data?.projectDeployment);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.access) {
      fetchAllProjectDeploymentName();
    };
  }, [debouncedSearchName, isLoading, team, permissions]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [name]: checked
          ? [...prevFilters[name], value]
          : prevFilters[name].filter((item) => item !== value),
        page: 1,
      }));
    } else {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [name]: value,
        page: 1,
      }));
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.access) {
      fetchAllProjectDeploymentData();
    };
  }, [debouncedSearch, filters.limit, filters.page, filters.sort, filters.nameFilter, isLoading, team, permissions]);

  const handleDelete = async (id) => {
    let isdelete = prompt("If you want to delete, type \"yes\".");

    if (isdelete === "yes") {
      try {
        const response = await axios.delete(`${base_url}/api/v1/projectDeployment/delete-projectDeployment/${id}`, {
          headers: {
            Authorization: validToken,
          },
        });

        if (response?.data?.success) {
          toast.success("Deleted successfully");
          fetchAllProjectDeploymentData();
        };
      } catch (error) {
        console.log("Error while deleting project timing:", error.message);
        toast.error("Error while deleting");
      };
    } else if (isdelete !== "") {
      alert("Type only \"yes\".");
    };
  };

  const exportProjectDeploymentListAsExcel = () => {
    const element = document.querySelector("#exportProjectDeploymentList");
    if (!element) return;
    const workbook = XLSX.utils.table_to_book(element, { sheet: "Project Deployment List" });
    const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    const blob = new Blob([s2ab(excelData)], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-deployment-list.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  function s2ab(s) {
    const buffer = new ArrayBuffer(s.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xFF;
    };
    return buffer;
  };

  const exportProjectDeploymentListAsPdf = () => {
    const element = document.querySelector("#exportProjectDeploymentList");
    const options = {
      filename: "project-deployment-list.pdf",
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

  const fetchSingleClientData = async (clientId) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/customer/single-customer/${clientId}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setClient(response?.data?.customer);
      };
    } catch (error) {
      console.log("Error while fetching single customer:", error.message);
    };
  };

  const fetchSingleProjectDeploymentData = async (id) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/projectDeployment/single-projectDeployment/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setDeploymentData(response?.data?.projectDeployment);
      };
    } catch (error) {
      console.log("Error while fetching single project deployment:", error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.access && id) {
      fetchSingleProjectDeploymentData(id);
    };
  }, [id, isLoading, team, permissions]);

  useEffect(() => {
    if (!isLoading && team && permissions?.access && clientId) {
      fetchSingleClientData(clientId);
    };
  }, [clientId, isLoading, team, permissions]);

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
        <div className="content" id="exportProjectDeploymentList">
          <div className="row">
            <div className="col-md-12">
              {/* Page Header */}
              <div className="page-header">
                <div className="row align-items-center">
                  <div className="col-4">
                    <h4 className="page-title">Project Deployment<span className="count-title">{total}</span></h4>
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
                  {/* Search */}
                  <div className="search-section">
                    <div className="row">
                      <div className="col-md-5 col-sm-4">
                        <div className="form-wrap icon-form">
                          <span className="form-icon"><i className="ti ti-search" /></span>
                          <input type="text" className="form-control" placeholder="Search Project Deployment" value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))} />
                        </div>
                      </div>
                      <div className="col-md-7 col-sm-8">
                        <div className="export-list text-sm-end">
                          <ul>
                            {
                              (permissions?.export) && (
                                <li>
                                  <div className="export-dropdwon">
                                    <Link to="#" className="dropdown-toggle" data-bs-toggle="dropdown">
                                      <i className="ti ti-package-export" />
                                      Export
                                    </Link>
                                    <div className="dropdown-menu  dropdown-menu-end">
                                      <ul>
                                        <li>
                                          <Link to="#" onClick={() => setTimeout(() => { exportProjectDeploymentListAsPdf() }, 0)}>
                                            <i className="ti ti-file-type-pdf text-danger" />
                                            Export as PDF
                                          </Link>
                                        </li>
                                        <li>
                                          <Link to="#" onClick={() => setTimeout(() => { exportProjectDeploymentListAsExcel() }, 0)}>
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
                            {
                              (permissions?.create) && (
                                <li>
                                  <Link to="/add-project-deployment" className="btn btn-primary">
                                    <i className="ti ti-square-rounded-plus" />
                                    Add New Project Deployment
                                  </Link>
                                </li>
                              )
                            }
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* /Search */}

                  {/* Filter */}
                  <div className="filter-section filter-flex">
                    <div className="sortby-list">
                      <ul>
                        <li>
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
                      </ul>
                    </div>
                    <div className="filter-list">
                      <ul>
                        <li>
                          <div className="form-sorts dropdown">
                            <Link to="#" data-bs-toggle="dropdown" data-bs-auto-close="false"><i className="ti ti-filter-share" />Filter</Link>
                            <div className="filter-dropdown-menu dropdown-menu  dropdown-menu-xl-end">
                              <div className="filter-set-view">
                                <div className="filter-set-head">
                                  <h4><i className="ti ti-filter-share" />Filter</h4>
                                </div>
                                <div className="accordion" id="accordionExample">
                                  <div className="filter-set-content">
                                    <div className="filter-set-content-head">
                                      <Link to="#" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">Website Name</Link>
                                    </div>
                                    <div className="filter-set-contents accordion-collapse collapse show" id="collapseTwo" data-bs-parent="#accordionExample">
                                      <div className="filter-content-list">
                                        <div className="form-wrap icon-form">
                                          <span className="form-icon"><i className="ti ti-search" /></span>
                                          <input type="text" className="form-control" placeholder="Search Website Name" onChange={(e) => setName(e.target.value)} />
                                        </div>
                                        <ul>
                                          {
                                            nameData?.map((n) => (
                                              <li key={n?._id}>
                                                <div className="filter-checks">
                                                  <label className="checkboxs">
                                                    <input
                                                      type="checkbox"
                                                      name="nameFilter"
                                                      value={n?.websiteName}
                                                      checked={filters.nameFilter.includes(n?.websiteName)}
                                                      onChange={handleFilterChange}
                                                    />
                                                    <span className="checkmarks" />
                                                  </label>
                                                </div>
                                                <div className="collapse-inside-text">
                                                  <h5>{n?.websiteName}</h5>
                                                </div>
                                              </li>
                                            ))
                                          }
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="filter-reset-btns">
                                  <div className="row">
                                    <div className="col-6">
                                      <Link to="#" className="btn btn-light" onClick={() => setFilters((prev) => ({ ...prev, nameFilter: [] }))}>Reset</Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div className="view-icons">
                            <Link to="#" className="active"><i className="ti ti-list-tree" /></Link>
                            <Link to="#"><i className="ti ti-grid-dots" /></Link>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  {/* /Filter */}

                  {/* Project Deployment List */}
                  <div className="table-responsive custom-table">
                    <table className="table table-bordered table-striped custom-border">
                      <thead className="thead-light">
                        <tr>
                          <th className="no-sort">
                            <label className="checkboxs"><input type="checkbox" id="select-all" /><span className="checkmarks" /></label>
                          </th>
                          <th>#</th>
                          {
                            (permissions?.access) && (
                              <th>View</th>
                            )
                          }
                          {
                            (filedPermissions?.websiteName?.show) && (
                              <th>Website Name</th>
                            )
                          }
                          {/* {
                            (filedPermissions?.domainExpiryDate?.show) && (
                              <th>Domain Expiry Date</th>
                            )
                          }
                          {
                            (filedPermissions?.domainExpireIn?.show) && (
                              <th>Domain Expire In</th>
                            )
                          } */}
                          {
                            (filedPermissions?.domainExpiryStatus?.show) && (
                              <th>Domain Status</th>
                            )
                          }
                          {
                            (filedPermissions?.hostingExpiryStatus?.show) && (
                              <th>Hosting Status</th>
                            )
                          }
                          {
                            (filedPermissions?.sslExpiryStatus?.show) && (
                              <th>SSL Status</th>
                            )
                          }
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
                              <td>{(filters.page - 1) * filters.limit + index + 1}</td>
                              {
                                (permissions?.access) && (
                                  <td><Link to="#" onClick={() => openInfoModal(d?._id)}><i className="fas fa-eye"></i></Link></td>
                                )
                              }
                              {
                                (filedPermissions?.websiteName?.show) && (
                                  <td>
                                    <span>{d?.websiteName}</span>
                                    {" "}
                                    <a href={d?.websiteLink} target="_blank">
                                      <i className="ti ti-external-link" style={{ color: "blue" }}></i>
                                    </a>
                                    {" "}
                                    <span onClick={() => openModal(d?.client?._id)} style={{ color: '#fff', cursor: 'pointer', fontSize: '0.75rem', padding: '0.1rem 0.3rem', borderRadius: '0.25rem', display: 'inline-block', background: "#FFA201" }}>
                                      Client Info
                                    </span>
                                  </td>
                                )
                              }
                              {/* {
                                (filedPermissions?.domainExpiryDate?.show) && (
                                  <td>{formatDate(d?.domainExpiryDate)}</td>
                                )
                              }
                              {
                                filedPermissions?.domainExpireIn?.show && (
                                  <td>
                                    <div style={{
                                      backgroundColor: d?.domainExpiryStatus === "Expired" || parseInt(d?.domainExpireIn) <= 30 ? "#e57373" : "transparent",
                                      color: d?.domainExpiryStatus === "Expired" || parseInt(d?.domainExpireIn) <= 30 ? "white" : "inherit",
                                      textAlign: d?.domainExpiryStatus === "Expired" || parseInt(d?.domainExpireIn) <= 30 ? "center" : "inherit",
                                      fontWeight: d?.domainExpiryStatus === "Expired" || parseInt(d?.domainExpireIn) <= 30 ? "bold" : "normal",
                                      borderRadius: d?.domainExpiryStatus === "Expired" || parseInt(d?.domainExpireIn) <= 30 ? "4px" : "none",
                                      padding: d?.domainExpiryStatus === "Expired" || parseInt(d?.domainExpireIn) <= 30 ? "4px 0px" : "inherit",
                                      width: d?.domainExpiryStatus === "Expired" || parseInt(d?.domainExpireIn) <= 30 ? "70px" : "auto",
                                    }}>
                                      {d?.domainExpireIn}
                                    </div>
                                  </td>
                                )
                              } */}
                              {
                                (filedPermissions?.domainExpiryStatus?.show) && (
                                  <td>
                                    <div style={{
                                      backgroundColor: d?.domainExpiryStatus === "Expired" ? "#e57373" : "#81c784",
                                      color: "white",
                                      textAlign: "center",
                                      fontWeight: "bold",
                                      borderRadius: "4px",
                                      padding: "4px 0px",
                                      width: "70px",
                                    }}>
                                      {d?.domainExpiryStatus}
                                    </div>
                                  </td>
                                )
                              }
                              {
                                (filedPermissions?.hostingExpiryStatus?.show) && (
                                  <td>
                                    <div style={{
                                      backgroundColor: d?.hostingExpiryStatus === "Expired" ? "#e57373" : "#81c784",
                                      color: "white",
                                      textAlign: "center",
                                      fontWeight: "bold",
                                      borderRadius: "4px",
                                      padding: "4px 0px",
                                      width: "70px",
                                    }}>
                                      {d?.hostingExpiryStatus}
                                    </div>
                                  </td>
                                )
                              }
                              {
                                (filedPermissions?.sslExpiryStatus?.show) && (
                                  <td>
                                    <div style={{
                                      backgroundColor: d?.sslExpiryStatus === "Expired" ? "#e57373" : "#81c784",
                                      color: "white",
                                      textAlign: "center",
                                      fontWeight: "bold",
                                      borderRadius: "4px",
                                      padding: "4px 0px",
                                      width: "70px",
                                    }}>
                                      {d?.sslExpiryStatus}
                                    </div>
                                  </td>
                                )
                              }
                              <td>
                                <div className="table-action">
                                  <Link to="#" className="action-icon" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="fa fa-ellipsis-v"></i>
                                  </Link>
                                  <div className="dropdown-menu dropdown-menu-right">
                                    {
                                      (permissions?.update) && (
                                        <Link to={`/edit-project-deployment/${d?._id}`} className="dropdown-item">
                                          <i className="ti ti-edit text-blue"></i>
                                          Update
                                        </Link>
                                      )
                                    }
                                    {
                                      permissions?.update && permissions?.delete && (
                                        <hr className="horizontal-line" />
                                      )
                                    }
                                    {
                                      (permissions?.delete) && (
                                        <Link to="#" className="dropdown-item" onClick={() => handleDelete(d?._id)}>
                                          <i className="ti ti-trash text-danger"></i>
                                          Delete
                                        </Link>
                                      )
                                    }
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
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
                          <h5 style={{ textAlign: "center", color: "#00918E" }}>
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
                  {/* /Project Deployment List */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}

      {/* Client Info Modal */}
      <Modal show={isOpen} onHide={closeModal} size="lg" dialogClassName="modal-no-shadow">
        <Modal.Header closeButton>
          <h5>Client Information</h5>
        </Modal.Header>
        <Modal.Body>
          <div className="container">
            <Card className="mt-0 mb-0">
              <Card.Body>
                <Card.Text className="mb-2"><strong>Name: </strong>{client?.name}</Card.Text>
                <Card.Text className="mb-2"><strong>Email: </strong>{client?.email}</Card.Text>
                <Card.Text className="mb-2"><strong>Mobile: </strong> {client?.mobile}</Card.Text>
                <Card.Text className="mb-2"><strong>Company Name: </strong>{client?.companyName}</Card.Text>
                <Card.Text className="mb-2"><strong>GST Number:</strong>{client?.GSTNumber}</Card.Text>
                <Card.Text className="mb-2"><strong>State: </strong>{client?.state}</Card.Text>
                <Card.Text className="mb-2"><strong>Address: </strong>{client?.address}</Card.Text>
              </Card.Body>
            </Card>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
      {/* /Client Info Modal */}

      {/* More info Modal */}
      <Modal show={isInfoOpen} onHide={closeInfoModal} size="lg" dialogClassName="modal-no-shadow">
        <Modal.Header closeButton>
          <h5>Project Deployment Information</h5>
        </Modal.Header>
        <Modal.Body>
          <div className="container">
            {/* Client Information */}
            <Card className="mt-0 mb-3">
              <Card.Header><strong>Client Information</strong></Card.Header>
              <Card.Body>
                <Card.Text className="mb-2"><strong>Name:</strong> {deploymentData?.client?.name}</Card.Text>
                <Card.Text className="mb-2"><strong>Email:</strong> {deploymentData?.client?.email}</Card.Text>
                <Card.Text className="mb-2"><strong>Mobile:</strong> {deploymentData?.client?.mobile}</Card.Text>
                <Card.Text className="mb-2"><strong>Company Name:</strong> {deploymentData?.client?.companyName}</Card.Text>
                <Card.Text className="mb-2"><strong>GST Number:</strong> {deploymentData?.client?.GSTNumber}</Card.Text>
                <Card.Text className="mb-2"><strong>State:</strong> {deploymentData?.client?.state}</Card.Text>
                <Card.Text className="mb-2"><strong>Address:</strong> {deploymentData?.client?.address}</Card.Text>
              </Card.Body>
            </Card>
            {/* Project Information */}
            <Card className="mb-3">
              <Card.Header><strong>Project Information</strong></Card.Header>
              <Card.Body>
                <Card.Text className="mb-2"><strong>Website Name:</strong> {deploymentData?.websiteName}</Card.Text>
                <Card.Text className="mb-2">
                  <strong>Website Link:</strong>{" "}
                  <a href={deploymentData?.websiteLink} style={{ color: "blue" }} target="_blank" rel="noopener noreferrer">
                    {deploymentData?.websiteLink}
                  </a>
                </Card.Text>
              </Card.Body>
            </Card>
            {/* Domain Information */}
            <Card className="mb-3">
              <Card.Header><strong>Domain Information</strong></Card.Header>
              <Card.Body>
                <Card.Text className="mb-2"><strong>Purchase Date:</strong> {deploymentData?.domainPurchaseDate}</Card.Text>
                <Card.Text className="mb-2"><strong>Expiry Date:</strong> {deploymentData?.domainExpiryDate}</Card.Text>
                <Card.Text className="mb-2"><strong>Expire In:</strong> {deploymentData?.domainExpireIn}</Card.Text>
                <Card.Text className="mb-2"><strong>Status:</strong> {deploymentData?.domainExpiryStatus}</Card.Text>
              </Card.Body>
            </Card>
            {/* Hosting Information */}
            <Card className="mb-3">
              <Card.Header><strong>Hosting Information</strong></Card.Header>
              <Card.Body>
                <Card.Text className="mb-2"><strong>Purchase Date:</strong> {deploymentData?.hostingPurchaseDate}</Card.Text>
                <Card.Text className="mb-2"><strong>Expiry Date:</strong> {deploymentData?.hostingExpiryDate}</Card.Text>
                <Card.Text className="mb-2"><strong>Expire In:</strong> {deploymentData?.hostingExpireIn}</Card.Text>
                <Card.Text className="mb-2"><strong>Status:</strong> {deploymentData?.hostingExpiryStatus}</Card.Text>
              </Card.Body>
            </Card>
            {/* SSL Information */}
            <Card className="mb-3">
              <Card.Header><strong>SSL Information</strong></Card.Header>
              <Card.Body>
                <Card.Text className="mb-2"><strong>Purchase Date:</strong> {deploymentData?.sslPurchaseDate}</Card.Text>
                <Card.Text className="mb-2"><strong>Expiry Date:</strong> {deploymentData?.sslExpiryDate}</Card.Text>
                <Card.Text className="mb-2"><strong>Expire In:</strong> {deploymentData?.sslExpireIn}</Card.Text>
                <Card.Text className="mb-2"><strong>Status:</strong> {deploymentData?.sslExpiryStatus}</Card.Text>
              </Card.Body>
            </Card>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeInfoModal}>Close</Button>
        </Modal.Footer>
      </Modal>
      {/* /More info Modal */}
    </>
  );
};

export default ProjectDeployment;