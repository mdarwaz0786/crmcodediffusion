/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from "../../context/authContext.jsx";
import html2pdf from "html2pdf.js";
import * as XLSX from 'xlsx';
import Preloader from "../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const PaymentList = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState("");
  const [loading, setLoading] = useState(true);
  const { validToken, team, isLoading } = useAuth();
  const [nameData, setNameData] = useState([]);
  const [nameSearch, setNameSearch] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    nameFilter: [],
    sort: "Descending",
    page: 1,
    limit: 20,
    year: "",
    month: "",
  });

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
  const debouncedSearchName = useDebounce(nameSearch, 500);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/v1/payment/all-payment`, {
        headers: {
          Authorization: validToken,
        },
        params: {
          search: filters.search,
          sort: filters.sort,
          page: filters.page,
          limit: filters.limit,
          nameFilter: filters.nameFilter.map(String),
          year: filters.year,
          month: filters.month,
        },
      });

      if (response?.data?.success) {
        setData(response?.data?.payment);
        setTotal(response?.data?.totalCount);
        setLoading(false);
      };
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    };
  };

  const fetchAllPaymentName = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/payment/all-payment`, {
        headers: {
          Authorization: validToken,
        },
        params: {
          nameSearch,
        },
      });

      if (response?.data?.success) {
        setNameData(response?.data?.payment);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team) {
      fetchAllPaymentName();
    };
  }, [debouncedSearchName, isLoading, team]);

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
    if (!isLoading && team) {
      fetchAllData();
    };
  }, [debouncedSearch, filters.limit, filters.page, filters.sort, filters.nameFilter, filters.year, filters.month, isLoading, team]);

  const handleDelete = async (id) => {
    let isdelete = prompt("If you want to delete, type \"yes\".");

    if (isdelete === "yes") {
      try {
        const response = await axios.delete(`${base_url}/api/v1/payment/delete-payment/${id}`, {
          headers: {
            Authorization: validToken,
          },
        });

        if (response?.data?.success) {
          toast.success("Deleted successfully");
          fetchAllData();
        };
      } catch (error) {
        console.log("Error while deleting payment:", error.message);
        toast.error("Error while deleting");
      };
    };
  };

  const exportPaymentListAsExcel = () => {
    if (!data || data?.length === 0) {
      alert("No data available to export");
      return;
    };

    const exportData = data?.map((entry, index) => {
      return {
        "#": index + 1 || "1",
        "InvoiceId": entry?.proformaInvoiceId || "N/A",
        "Transaction ID": entry?.transactionId || "N/A",
        "Project Name": entry?.projectName || "N/A",
        "Project Cost": `₹${entry?.projectCost}` || "0",
        "Client Name": entry?.clientName || "N/A",
        "Email": entry?.email || "N/A",
        "Phone": entry?.phone || "N/A",
        "State": entry?.state || "N/A",
        "Tax": entry?.tax || "N/A",
        "Payment Status": entry?.paymentStatus || "N/A",
        "Payment Date": formatDate(entry?.paymentDate) || "N/A",
        "Amount": `₹${entry?.amount}` || "0",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...exportData.map((row) => row[key] ? row[key].toString().length : 0)) + 2,
    }));

    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "payment");

    XLSX.writeFile(workbook, `payment.xlsx`);
  };

  const exportPaymentListAsPdf = () => {
    const element = document.querySelector("#exportPaymentList");
    const options = {
      filename: "payment",
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
    html2pdf().set(options).from(element).save();
  };

  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (team?.role?.name?.toLowerCase() !== "admin") {
    return <Navigate to="/" />;
  };

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content" id="exportPaymentList">
          <div className="row">
            <div className="col-md-12">
              {/* Page Header */}
              <div className="page-header">
                <div className="row align-items-center">
                  <div className="col-4">
                    <h4 className="page-title">Payments<span className="count-title">{total}</span></h4>
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
                          <input type="text" className="form-control" placeholder="Search Payment" value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))} />
                        </div>
                      </div>
                      <div className="col-md-7 col-sm-8">
                        <div className="export-list text-sm-end">
                          <ul>
                            <li>
                              <div className="export-dropdwon">
                                <Link to="#" className="dropdown-toggle" data-bs-toggle="dropdown">
                                  <i className="ti ti-package-export" />
                                  Export
                                </Link>
                                <div className="dropdown-menu  dropdown-menu-end">
                                  <ul>
                                    <li>
                                      <Link to="#" onClick={() => setTimeout(() => { exportPaymentListAsPdf() }, 0)}>
                                        <i className="ti ti-file-type-pdf text-danger" />
                                        Export as PDF
                                      </Link>
                                    </li>
                                    <li>
                                      <Link to="#" onClick={() => setTimeout(() => { exportPaymentListAsExcel() }, 0)}>
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
                    </div>
                  </div>
                  {/* /Search */}

                  {/* Filter */}
                  <div className="filter-section filter-flex">
                    <div className="sortby-list">
                      <ul>
                        <li>
                          <label className="pb-1">Sort:</label>
                          <div className="sort-dropdown drop-down">
                            <Link to="#" className="dropdown-toggle" data-bs-toggle="dropdown"><i className="ti ti-sort-ascending-2" />{filters.sort}</Link>
                            <div className="dropdown-menu dropdown-menu-start">
                              <ul>
                                <li>
                                  <Link to="#" onClick={() => setFilters((prev) => ({ ...prev, sort: "Ascending", page: 1 }))} >
                                    <i className="ti ti-circle-chevron-right" />
                                    Ascending
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#" onClick={() => setFilters((prev) => ({ ...prev, sort: "Descending", page: 1 }))} >
                                    <i className="ti ti-circle-chevron-right" />
                                    Descending
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </li>
                        <li>
                          <label className="pb-1">Year:</label>
                          <select
                            id="year"
                            value={filters.year}
                            onChange={handleYearChange}
                            className="form-select"
                          >
                            <option value="">All</option>
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
                            value={filters.month}
                            onChange={handleMonthChange}
                            className="form-select"
                          >
                            <option value="">All</option>
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
                      </ul>
                    </div>
                    <div className="filter-list pt-4">
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
                                      <Link to="#" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">Invoice Id</Link>
                                    </div>
                                    <div className="filter-set-contents accordion-collapse collapse show" id="collapseTwo" data-bs-parent="#accordionExample">
                                      <div className="filter-content-list">
                                        <div className="form-wrap icon-form">
                                          <span className="form-icon"><i className="ti ti-search" /></span>
                                          <input type="text" className="form-control" placeholder="Search Invoice Id" onChange={(e) => setNameSearch(e.target.value)} />
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
                                                      value={n?.proformaInvoiceId}
                                                      checked={filters.nameFilter.includes(n?.proformaInvoiceId)}
                                                      onChange={handleFilterChange}
                                                    />
                                                    <span className="checkmarks" />
                                                  </label>
                                                </div>
                                                <div className="collapse-inside-text">
                                                  <h5>{n?.proformaInvoiceId}</h5>
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

                  {/* Payment List */}
                  <div className="table-responsive custom-table">
                    <table className="table table-bordered table-striped custom-border">
                      <thead className="thead-light">
                        <tr>
                          <th className="no-sort">
                            <label className="checkboxs"><input type="checkbox" id="select-all" /><span className="checkmarks" /></label>
                          </th>
                          <th>#</th>
                          <th>View</th>
                          <th>Invoice Id</th>
                          <th>Project Name</th>
                          <th>Client Name</th>
                          <th>Amount</th>
                          <th>Status</th>
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
                              <td><Link to={`/single-payment/${d?._id}/${d?.transactionId}`}><i className="fas fa-eye"></i></Link></td>
                              <td>{d?.proformaInvoiceId}</td>
                              <td>{d?.projectName}</td>
                              <td>{d?.clientName}</td>
                              <td>₹{d?.amount}</td>
                              <td>{d?.paymentStatus}</td>
                              <td>
                                <div className="table-action">
                                  <Link to="#" className="action-icon" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="fa fa-ellipsis-v"></i>
                                  </Link>
                                  <div className="dropdown-menu dropdown-menu-right">
                                    <Link to="#" className="dropdown-item" onClick={() => handleDelete(d?._id)}>
                                      <i className="ti ti-trash text-danger"></i>
                                      Delete
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
                          <h5 style={{ textAlign: "center", color: "#ffb300" }}>
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
                              <Link to="#" onClick={() => setFilters((prev) => ({ ...prev, page: filters.page - 1 }))} aria-controls="project-list" aria-disabled={filters.page === 1} role="link" data-dt-idx="previous" tabIndex="-1" className="page-link">
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
                  {/* / Payment List */}
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

export default PaymentList;