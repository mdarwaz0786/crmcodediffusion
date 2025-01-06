/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from "../../context/authContext.jsx";
import html2pdf from "html2pdf.js";
import * as XLSX from 'xlsx';
import Preloader from "../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const Service = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState("");
  const [loading, setLoading] = useState(true);
  const { validToken, team, isLoading } = useAuth();

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/v1/service/all-service`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setData(response?.data?.data);
        setTotal(response?.data?.totalCount);
        setLoading(false);
      };
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    };
  };

  useEffect(() => {
    if (!isLoading && team) {
      fetchAllData();
    };
  }, [isLoading, team]);

  const handleDelete = async (id) => {
    let isdelete = prompt("If you want to delete, type \"yes\".");

    if (isdelete === "yes") {
      try {
        const response = await axios.delete(`${base_url}/api/v1/service/delete-service/${id}`, {
          headers: {
            Authorization: validToken,
          },
        });

        if (response?.data?.success) {
          toast.success("Deleted successfully");
          fetchAllData();
        };
      } catch (error) {
        console.log("Error while deleting service:", error.message);
        toast.error("Error while deleting");
      };
    };
  };

  const exportServiceListAsExcel = () => {
    if (data?.length === 0) {
      alert("No data available to export");
      return;
    };

    const exportData = data?.map((entry) => ({
      "Name": entry?.name || "N/A",
      "Description": entry?.description || "N/A",
    }));

    if (exportData?.length === 0) {
      alert("No service found to export");
      return;
    };

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Calculate column width dynamically
    const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...exportData.map((row) => (row[key] ? row[key].toString().length : 0))) + 2,
    }));

    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "service");

    XLSX.writeFile(workbook, `service.xlsx`);
  };

  const exportServiceListAsPdf = () => {
    const element = document.querySelector("#exportServiceList");
    const options = {
      filename: "service",
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

  if (isLoading) {
    return <Preloader />;
  };

  if (!team?.role?.name.toLowerCase() === "admin") {
    return <Navigate to="/" />;
  };

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content" id="exportServiceList">
          <div className="row">
            <div className="col-md-12">
              {/* Page Header */}
              <div className="page-header">
                <div className="row align-items-center">
                  <div className="col-4">
                    <h4 className="page-title">Services<span className="count-title">{total}</span></h4>
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
                                      <Link to="#" onClick={() => setTimeout(() => { exportServiceListAsPdf() }, 0)}>
                                        <i className="ti ti-file-type-pdf text-danger" />
                                        Export as PDF
                                      </Link>
                                    </li>
                                    <li>
                                      <Link to="#" onClick={() => setTimeout(() => { exportServiceListAsExcel() }, 0)}>
                                        <i className="ti ti-file-spreadsheet text-success" />
                                        Export as EXCEL
                                      </Link>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </li>
                            <li>
                              <Link to="/add-service" className="btn btn-primary">
                                <i className="ti ti-square-rounded-plus" />
                                Add New service
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* /Search */}

                  {/* Service List */}
                  <div className="table-responsive custom-table">
                    <table className="table table-bordered table-striped custom-border">
                      <thead className="thead-light">
                        <tr>
                          <th className="no-sort">
                            <label className="checkboxs"><input type="checkbox" id="select-all" /><span className="checkmarks" /></label>
                          </th>
                          <th>#</th>
                          <th>Name</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          loading ? (
                            <h6 style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>Loading...</h6>
                          ) : (
                            data?.map((d, index) => (
                              <tr key={d?._id}>
                                <th className="no-sort">
                                  <label className="checkboxs"><input type="checkbox" id="select-all" /><span className="checkmarks" /></label>
                                </th>
                                <td>{index + 1}</td>
                                <td>{d?.name}</td>
                                <td>
                                  <div className="table-action">
                                    <Link to="#" className="action-icon" data-bs-toggle="dropdown" aria-expanded="false">
                                      <i className="fa fa-ellipsis-v"></i>
                                    </Link>
                                    <div className="dropdown-menu dropdown-menu-right">
                                      <Link to={`/edit-service/${d?._id}`} className="dropdown-item">
                                        <i className="ti ti-edit text-blue"></i>
                                        Update
                                      </Link>
                                      <hr className="horizontal-line" />
                                      <Link to="#" className="dropdown-item" onClick={() => handleDelete(d?._id)}>
                                        <i className="ti ti-trash text-danger"></i>
                                        Delete
                                      </Link>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )
                        }
                      </tbody>
                    </table>
                  </div>
                  {/* /Service List */}
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

export default Service;