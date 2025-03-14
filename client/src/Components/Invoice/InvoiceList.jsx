/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from "../../context/authContext.jsx";
import html2pdf from "html2pdf.js";
import * as XLSX from 'xlsx';
import JSZip from "jszip";
import FileSaver from "file-saver";
import Preloader from "../../Preloader.jsx";
import logo from '../../Assets/logo.png';
const base_url = import.meta.env.VITE_API_BASE_URL;

const InvoiceList = () => {
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
  const permissions = team?.role?.permissions?.invoice;
  const filedPermissions = team?.role?.permissions?.invoice?.fields;

  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
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
  const debouncedSearchName = useDebounce(nameSearch, 500);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/v1/invoice/all-invoice`, {
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
        setData(response?.data?.invoice);
        setTotal(response?.data?.totalCount);
        setLoading(false);
      };
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    };
  };

  const fetchAllInvoiceName = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/invoice/all-invoice`, {
        headers: {
          Authorization: validToken,
        },
        params: {
          nameSearch,
        },
      });

      if (response?.data?.success) {
        setNameData(response?.data?.invoice);
      };
    } catch (error) {
      console.log(error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.access) {
      fetchAllInvoiceName();
    };
  }, [debouncedSearchName, isLoading, team, permissions]);

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
    if (!isLoading && team && permissions?.access) {
      fetchAllData();
    };
  }, [debouncedSearch, filters.limit, filters.page, filters.sort, filters.nameFilter, filters.year, filters.month, isLoading, team, permissions]);

  const handleDelete = async (id) => {
    let isdelete = prompt("If you want to delete, type \"yes\".");

    if (isdelete === "yes") {
      try {
        const response = await axios.delete(`${base_url}/api/v1/invoice/delete-invoice/${id}`, {
          headers: {
            Authorization: validToken,
          },
        });

        if (response?.data?.success) {
          toast.success("Deleted successfully");
          fetchAllData();
        };
      } catch (error) {
        console.log("Error while deleting invoice:", error.message);
        toast.error("Error while deleting");
      };
    };
  };

  const exportInvoiceListAsExcel = () => {
    if (!data || data?.length === 0) {
      alert("No data available to export");
      return;
    };

    const exportData = data.map((entry, index) => {
      return {
        "#": index + 1 || "1",
        "Office Name": entry?.office?.name || "N/A",
        "Date": formatDate(entry?.date) || "N/A",
        "InvoiceId": entry?.invoiceId || "N/A",
        "Project Name": entry?.proformaInvoiceDetails?.projectName || entry?.project?.projectName,
        "Project Cost": entry?.proformaInvoiceDetails?.projectCost || entry?.project?.projectPrice,
        "Client Name": entry?.proformaInvoiceDetails?.clientName || entry?.project?.customer?.name,
        "Sub Total": `₹${entry?.subtotal}` || "0",
        "CGST": entry?.CGST > 0 ? `₹${entry?.CGST}` : "Not Applicable",
        "SGST": entry?.SGST > 0 ? `₹${entry?.SGST}` : "Not Applicable",
        "IGST": entry?.IGST > 0 ? `₹${entry?.IGST}` : "Not Applicable",
        "Total": `₹${entry?.total}` || "0",
        "Balance Due": `₹${entry?.balanceDue}` || "0",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...exportData.map((row) => row[key] ? row[key].toString().length : 0)) + 2,
    }));

    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "tax-invoice");

    XLSX.writeFile(workbook, `tax-invoice.xlsx`);
  };

  const exportInvoiceListAsPdf = () => {
    const element = document.querySelector("#exportInvoiceList");
    const options = {
      filename: "tax-invoice",
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

  const generatePDFsAndZip = async () => {
    const zip = new JSZip();

    // Generate PDFs for each invoice
    for (const invoice of data) {
      const element = document.querySelector(`#invoice-${invoice?._id}`);
      const pdfOptions = {
        filename: `${invoice?.invoiceId}-${invoice?.proformaInvoiceDetails?.companyName || invoice?.project?.customer?.companyName}-Tax-Invoice.pdf`,
        margin: [0, 0, 10, 0],
        html2canvas: {
          useCORS: true,
          scale: 2,
        },
        jsPDF: {
          orientation: 'portrait',
          format: 'a4',
          unit: 'pt',
        },
      };

      // Pass pdfOptions to html2pdf
      const pdfBlob = await html2pdf().from(element).set(pdfOptions).output('blob');
      zip.file(`${invoice?.invoiceId}-${invoice?.proformaInvoiceDetails?.companyName || invoice?.project?.customer?.companyName}-Tax-Invoice.pdf`, pdfBlob);
    };

    // Generate the ZIP file and save it
    const content = await zip.generateAsync({ type: "blob" });
    FileSaver.saveAs(content, `${filters.month}-${filters.year}-Tax-Invoice.zip`);
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
        <div className="content" id="exportInvoiceList">
          <div className="row">
            <div className="col-md-12">
              {/* Page Header */}
              <div className="page-header">
                <div className="row align-items-center">
                  <div className="col-4">
                    <h4 className="page-title">Tax Invoices<span className="count-title">{total}</span></h4>
                  </div>
                  <div className="col-4 mb-3">
                    {
                      permissions?.export && (
                        <button className="btn btn-secondary" onClick={generatePDFsAndZip}>Download All</button>
                      )
                    }
                  </div>
                  <div className="col-4 text-end">
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
                          <input type="text" className="form-control" placeholder="Search Invoice" value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))} />
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
                                          <Link to="#" onClick={() => setTimeout(() => { exportInvoiceListAsPdf() }, 0)}>
                                            <i className="ti ti-file-type-pdf text-danger" />
                                            Export as PDF
                                          </Link>
                                        </li>
                                        <li>
                                          <Link to="#" onClick={() => setTimeout(() => { exportInvoiceListAsExcel() }, 0)}>
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
                                  <Link to="/add-invoice" className="btn btn-primary">
                                    <i className="ti ti-square-rounded-plus" />
                                    Add New Tax Invoice
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
                          <label className="pb-1">Sort:</label>
                          <div className="sort-dropdown drop-down">
                            <Link to="#" className="dropdown-toggle" data-bs-toggle="dropdown"><i className="ti ti-sort-ascending-2" />{filters.sort}</Link>
                            <div className="dropdown-menu  dropdown-menu-start">
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
                                                      value={n?.invoiceId}
                                                      checked={filters.nameFilter.includes(n?.invoiceId)}
                                                      onChange={handleFilterChange}
                                                    />
                                                    <span className="checkmarks" />
                                                  </label>
                                                </div>
                                                <div className="collapse-inside-text">
                                                  <h5>{n?.invoiceId}</h5>
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

                  {/* Invoice List */}
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
                            (filedPermissions?.invoiceId?.show) && (
                              <th>Invoice ID</th>
                            )
                          }
                          {
                            (filedPermissions?.project?.show) && (
                              <th>Project Name</th>
                            )
                          }
                          {
                            (filedPermissions?.project?.show) && (
                              <th>Client Name</th>
                            )
                          }
                          {
                            (filedPermissions?.total?.show) && (
                              <th>Total Amount</th>
                            )
                          }
                          {
                            (filedPermissions?.date?.show) && (
                              <th>Date</th>
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
                                  <td><Link to={`/single-invoice/${d?._id}`}><i className="fas fa-eye"></i></Link></td>
                                )
                              }
                              {
                                (filedPermissions?.invoiceId?.show) && (
                                  <td>{d?.invoiceId}</td>
                                )
                              }
                              {
                                (filedPermissions?.project?.show) && (
                                  <td>{d?.proformaInvoiceDetails?.projectName || d?.project?.projectName}</td>
                                )
                              }
                              {
                                (filedPermissions?.amount?.show) && (
                                  <td>{d?.proformaInvoiceDetails?.clientName || d?.project?.customer?.name}</td>
                                )
                              }
                              {
                                (filedPermissions?.total?.show) && (
                                  <td>₹{d?.total}</td>
                                )
                              }
                              {
                                (filedPermissions?.date?.show) && (
                                  <td>{formatDate(d?.date)}</td>
                                )
                              }
                              <td>
                                <div className="table-action">
                                  <Link to="#" className="action-icon" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="fa fa-ellipsis-v"></i>
                                  </Link>
                                  <div className="dropdown-menu dropdown-menu-right">
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
                  {/* /Invoice List */}
                </div>
              </div>
            </div>
          </div>

          {/* All Invoice in zip file */}
          <section className="zip-invoice">
            {
              data?.map((invoice) => (
                <div key={invoice?._id} id={`invoice-${invoice?._id}`} className="bg-white" style={{ margin: '20px auto' }}>
                  {/* Invoice Header */}
                  <div className="invoice-heading">
                    <div className="col-md-6">
                      <div className="logo mt-4 ps-4 mb-3">
                        <img src={invoice?.office?.logo || logo} width="150px" alt="logo" />
                      </div>
                    </div>
                    <div className="col-md-6 px-4">
                      <div className="name d-flex mt-4 justify-content-end">
                        <h4>TAX INVOICE</h4>
                      </div>
                    </div>
                  </div>
                  {/* Invoice Details */}
                  <div className="invoice row">
                    <div className="col-md-6 p-5 pt-0">
                      <div className="p-0 m-0"><strong>{invoice?.office?.name || "Code Diffusion Technologies"}</strong></div>
                      <div>Address :</div>
                      <div>{invoice?.office?.addressLine1 || "1020, Kirti Sikhar Tower"},</div>
                      <div>{invoice?.office?.addressLine2 || "District Centre, Janakpuri"},</div>
                      <div>{invoice?.office?.addressLine3 || "New Delhi"}.</div>
                      <div><strong>GST No: {invoice?.office?.GSTNumber || "O7FRWPS7288J3ZC"}</strong></div>
                    </div>
                    <div className="col-md-6 p-5 pt-0">
                      <div className="ubic-code d-flex justify-content-end">
                        <p>{invoice?.invoiceId}</p><br />
                      </div>
                      <div className="date-box d-flex justify-content-end mt-5 pt-3">
                        <div className="date px-1">
                          <strong>Date:</strong>
                        </div>
                        <div className="date text-end">
                          <p>{formatDate(invoice?.date)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-8 p-5" style={{ display: "flex", columnGap: "1rem" }}>
                      <div className="content w-100">
                        <div className="pera">
                          <h5 style={{ color: "#262a2a7a" }}>Bill To:</h5>
                          <div>
                            <strong style={{ color: "#000" }}>
                              {
                                invoice?.proformaInvoiceDetails?.companyName ||
                                invoice?.proformaInvoiceDetails?.clientName ||
                                invoice?.project?.customer?.companyName ||
                                invoice?.project?.customer?.clientName
                              }
                            </strong>
                          </div>
                          <div><strong>GST No: {invoice?.proformaInvoiceDetails?.GSTNumber || invoice?.project?.customer?.GSTNumber}</strong></div>
                        </div>
                      </div>
                      <div className="content w-100">
                        <div className="pera">
                          <h5 style={{ color: "#262a2a7a" }}>Ship To:</h5>
                          <p>
                            <strong style={{ color: "#000" }}>
                              {invoice?.proformaInvoiceDetails?.shipTo || invoice?.project?.customer?.address}
                            </strong>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 d-flex justify-content-end align-items-baseline" style={{ padding: "0 45px 0 0" }}>
                      <div style={{ borderRadius: "5px", display: "inline-block", fontWeight: "bold" }}><p>Balance Due: ₹{invoice?.total}</p></div>
                    </div>
                  </div>
                  <div className="row px-3">
                    <div className="col-md-12">
                      <table className="table mt-3" style={{ border: "0px solid white" }}>
                        <thead className='invoice-custom-table-header'>
                          <tr className="text-start">
                            <th scope="col">Item</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">Rate</th>
                            <th scope="col" className="text-end">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            invoice?.projects?.map((d) => (
                              <tr className="text-start" key={d?._id}>
                                <th scope="col">{invoice?.proformaInvoiceDetails?.projectName || invoice?.project?.projectName}</th>
                                <th scope="col" className="ps-5">1</th>
                                <th scope="col">₹{d?.subtotal}</th>
                                <th scope="col" className="text-end">₹{d?.subtotal}</th>
                              </tr>
                            ))
                          }
                        </tbody>
                        <tbody className="text-end mt-5 pt-5">
                          <tr>
                            <th scope="col" />
                            <th scope="col" />
                            <th scope="col-1">Subtotal :</th>
                            <th scope="col-2">₹{invoice?.subtotal}</th>
                          </tr>
                          {
                            (invoice?.CGST > 0) && (
                              <tr>
                                <th scope="col" />
                                <th scope="col" />
                                <th scope="col-1">CGST (9%) :</th>
                                <th scope="col-2">₹{invoice?.CGST}</th>
                              </tr>
                            )
                          }
                          {
                            (invoice?.SGST > 0) && (
                              <tr>
                                <th scope="col" />
                                <th scope="col" />
                                <th scope="col-1">SGST (9%) :</th>
                                <th scope="col-2">₹{invoice?.SGST}</th>
                              </tr>
                            )
                          }
                          {
                            (invoice?.IGST > 0) && (
                              <tr>
                                <th scope="col" />
                                <th scope="col" />
                                <th scope="col-1">IGST (18%) :</th>
                                <th scope="col-2">₹{invoice?.IGST}</th>
                              </tr>
                            )
                          }
                          <tr>
                            <th scope="col" />
                            <th scope="col" />
                            <th scope="col-1">Total :</th>
                            <th scope="col-2">₹{invoice?.total}</th>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="col-md-6 ps-4 m-0">
                    <div className="p-0 pb-1 m-0 text-dark"><strong>Notes:</strong></div>
                    <div className="p-0 pb-1 m-0 text-dark"><strong>Account Name: </strong>{invoice?.office?.accountName || "Code Diffusion Technologies"}</div>
                    <div className="p-0 pb-1 m-0 text-dark"><strong>Account Type: </strong>{invoice?.office?.accountType || "Current Account"}</div>
                    <div className="p-0 pb-1 m-0 text-dark"><strong>Account Number: </strong>{invoice?.office?.accountNumber || "60374584640"}</div>
                    <div className="p-0 pb-1 m-0 text-dark"><strong>Bank Name: </strong>{invoice?.office?.bankName || "Bank of Maharashtra"}</div>
                    <div className="p-0 pb-1 m-0 text-dark"><strong>IFSC Code: </strong>{invoice?.office?.IFSCCode || "mahb0001247"}</div>
                  </div>
                  <div className="col-md-6" />
                </div>
              ))
            }
          </section>
          {/* /All Invoice in zip file */}
        </div>
      </div>
      {/* /Page Wrapper */}
    </>
  );
};

export default InvoiceList;