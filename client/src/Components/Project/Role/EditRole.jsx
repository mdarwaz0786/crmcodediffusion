/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../../context/authContext.jsx";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Preloader from "../../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const EditRole = () => {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { team, validToken, isLoading } = useAuth();
  const fieldPermissions = team?.role?.permissions?.role?.fields;
  const permission = team?.role?.permissions?.role;
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState({
    project: {
      access: false,
      export: false,
      create: false,
      update: false,
      delete: false,
      fields: {
        projectName: { read: true, show: true },
        projectId: { read: true, show: true },
        customer: { read: true, show: true },
        projectType: { read: true, show: true },
        projectCategory: { read: true, show: true },
        projectTiming: { read: true, show: true },
        projectPriority: { read: true, show: true },
        projectStatus: { read: true, show: true },
        responsiblePerson: { read: true, show: true },
        teamLeader: { read: true, show: true },
        technology: { read: true, show: true },
        projectPrice: { read: true, show: true },
        payment: { read: true, show: true },
        totalPaid: { read: true, show: true },
        totalDues: { read: true, show: true },
        startDate: { read: true, show: true },
        endDate: { read: true, show: true },
        totalHour: { read: true, show: true },
        workDetail: { read: true, show: true },
        totalSpentHour: { read: true, show: true },
        totalRemainingHour: { read: true, show: true },
        description: { read: true, show: true },
      },
    },
    invoice: {
      access: false,
      export: false,
      create: false,
      update: false,
      delete: false,
      fields: {
        invoiceId: { read: true, show: true },
        project: { read: true, show: true },
        amount: { read: true, show: true },
        tax: { read: true, show: true },
        CGST: { read: true, show: true },
        SGST: { read: true, show: true },
        IGST: { read: true, show: true },
        total: { read: true, show: true },
        subtotal: { read: true, show: true },
        balanceDue: { read: true, show: true },
        date: { read: true, show: true },
      },
    },
    proformaInvoice: {
      access: false,
      export: false,
      create: false,
      update: false,
      delete: false,
      fields: {
        proformaInvoiceId: { read: true, show: true },
        date: { read: true, show: true },
        tax: { read: true, show: true },
        projectName: { read: true, show: true },
        projectCost: { read: true, show: true },
        clientName: { read: true, show: true },
        GSTNumber: { read: true, show: true },
        shipTo: { read: true, show: true },
        state: { read: true, show: true },
        CGST: { read: true, show: true },
        SGST: { read: true, show: true },
        IGST: { read: true, show: true },
        subtotal: { read: true, show: true },
        total: { read: true, show: true },
        balanceDue: { read: true, show: true },
      },
    },
    purchaseInvoice: {
      access: false,
      export: false,
      create: false,
      update: false,
      delete: false,
      fields: {
        name: { read: true, show: true },
        amount: { read: true, show: true },
        date: { read: true, show: true },
        bill: { read: true, show: true },
      },
    },
    projectDeployment: {
      access: false,
      export: false,
      create: false,
      update: false,
      delete: false,
      fields: {
        websiteName: { read: true, show: true },
        websiteLink: { read: true, show: true },
        client: { read: true, show: true },
        domainPurchaseDate: { read: true, show: true },
        domainExpiryDate: { read: true, show: true },
        domainExpireIn: { read: true, show: true },
        domainExpiryStatus: { read: true, show: true },
        hostingPurchaseDate: { read: true, show: true },
        hostingExpiryDate: { read: true, show: true },
        hostingExpireIn: { read: true, show: true },
        hostingExpiryStatus: { read: true, show: true },
        sslPurchaseDate: { read: true, show: true },
        sslExpiryDate: { read: true, show: true },
        sslExpireIn: { read: true, show: true },
        sslExpiryStatus: { read: true, show: true },
      },
    },
    attendance: {
      access: false,
      export: false,
      create: false,
      update: false,
      delete: false,
      fields: {
        employee: { read: true, show: true },
        holiday: { read: true, show: true },
        settings: { read: true, show: true },
      },
    },
    customer: {
      access: false,
      export: false,
      create: false,
      update: false,
      delete: false,
      fields: {
        name: { read: true, show: true },
        email: { read: true, show: true },
        mobile: { read: true, show: true },
        GSTNumber: { read: true, show: true },
        companyName: { read: true, show: true },
        state: { read: true, show: true },
        address: { read: true, show: true },
      },
    },
    team: {
      access: false,
      export: false,
      create: false,
      update: false,
      delete: false,
      fields: {
        employeeId: { read: true, show: true },
        name: { read: true, show: true },
        email: { read: true, show: true },
        mobile: { read: true, show: true },
        password: { read: true, show: true },
        joining: { read: true, show: true },
        dob: { read: true, show: true },
        monthlySalary: { read: true, show: true },
        workingHoursPerDay: { read: true, show: true },
        designation: { read: true, show: true },
        reportingTo: { read: true, show: true },
        role: { read: true, show: true },
      },
    },
    role: {
      access: false,
      export: false,
      create: false,
      update: false,
      delete: false,
      fields: {
        name: { read: true, show: true },
        permissions: { read: true, show: true },
      },
    },
    designation: {
      access: false,
      export: false,
      create: false,
      update: false,
      delete: false,
      fields: {
        name: { read: true, show: true },
        description: { read: true, show: true },
      },
    },
    department: {
      access: false,
      export: false,
      create: false,
      update: false,
      delete: false,
      fields: {
        name: { read: true, show: true },
        description: { read: true, show: true },
      },
    },
    technology: {
      access: false,
      export: false,
      create: false,
      update: false,
      delete: false,
      fields: {
        name: { read: true, show: true },
        description: { read: true, show: true },
      },
    },
    projectType: {
      access: false,
      export: false,
      create: false,
      update: false,
      delete: false,
      fields: {
        name: { read: true, show: true },
        description: { read: true, show: true },
      },
    },
    projectStatus: {
      access: false,
      export: false,
      create: false,
      update: false,
      delete: false,
      fields: {
        status: { read: true, show: true },
        description: { read: true, show: true },
      },
    },
    projectCategory: {
      access: false,
      export: false,
      create: false,
      update: false,
      delete: false,
      fields: {
        name: { read: true, show: true },
        description: { read: true, show: true },
      },
    },
    projectTiming: {
      access: false,
      export: false,
      create: false,
      update: false,
      delete: false,
      fields: {
        name: { read: true, show: true },
        description: { read: true, show: true },
      },
    },
    projectPriority: {
      access: false,
      export: false,
      create: false,
      update: false,
      delete: false,
      fields: {
        name: { read: true, show: true },
        description: { read: true, show: true },
      },
    },
  });

  const handleChange = (e) => {
    const { name, checked, type } = e.target;

    if (fieldPermissions?.permissions?.read) {
      e.preventDefault();
      return;
    };

    const [master, permission] = name.split('.');
    if (type === 'checkbox') {
      setPermissions((prevPermissions) => ({
        ...prevPermissions,
        [master]: {
          ...prevPermissions[master],
          [permission]: checked,
        },
      }));
    } else {
      setName(e.target.value);
    };
  };

  const handleFieldPermissionChange = (e) => {
    const { name, checked } = e.target;
    const [field, permission] = name.split('.');

    if (fieldPermissions?.permissions?.read) {
      e.preventDefault();
      return;
    };

    setPermissions((prevPermissions) => {
      const updatedFields = {
        ...prevPermissions[selectedMaster]?.fields,
        [field]: {
          ...prevPermissions[selectedMaster]?.fields?.[field],
          [permission]: checked,
        },
      };

      const allFieldsChecked = Object.values(updatedFields).every(
        (field) => field.read && field.show
      );

      setSelectAll(allFieldsChecked);

      return {
        ...prevPermissions,
        [selectedMaster]: {
          ...prevPermissions[selectedMaster],
          fields: updatedFields,
        },
      };
    });
  };

  const handleSelectAllChange = (e, checked) => {
    if (fieldPermissions?.permissions?.read) {
      e.preventDefault();
      return;
    };

    setSelectAll(checked);

    setPermissions((prevPermissions) => {
      const updatedFields = Object.keys(prevPermissions[selectedMaster]?.fields || {}).reduce(
        (fields, field) => {
          fields[field] = {
            read: checked,
            show: checked,
          };
          return fields;
        },
        {},
      );

      return {
        ...prevPermissions,
        [selectedMaster]: {
          ...prevPermissions[selectedMaster],
          fields: updatedFields,
        },
      };
    });
  };

  const fetchSingleRole = async (id) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/role/single-role/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setName(response?.data?.role?.name);
        setPermissions(response?.data?.role?.permissions);
      };
    } catch (error) {
      console.error('Error while fetching single role:', error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permission?.update && id) {
      fetchSingleRole(id);
    };
  }, [id, isLoading, team, permission]);

  const handleUpdate = async (e, id) => {
    e.preventDefault();

    // Create the update object
    const updateData = {};

    // Conditionally include fields based on permissions
    if (fieldPermissions?.name?.show && !fieldPermissions?.name?.read) {
      updateData.name = name;
    };

    if (fieldPermissions?.permissions?.show && !fieldPermissions?.permissions?.read) {
      updateData.permissions = permissions;
    };

    try {
      const response = await axios.put(`${base_url}/api/v1/role/update-role/${id}`, updateData, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setName("");
        setPermissions({
          project: {
            access: false,
            export: false,
            create: false,
            update: false,
            delete: false,
            fields: {
              projectName: { read: true, show: true },
              projectId: { read: true, show: true },
              customer: { read: true, show: true },
              projectType: { read: true, show: true },
              projectCategory: { read: true, show: true },
              projectTiming: { read: true, show: true },
              projectPriority: { read: true, show: true },
              projectStatus: { read: true, show: true },
              responsiblePerson: { read: true, show: true },
              teamLeader: { read: true, show: true },
              technology: { read: true, show: true },
              projectPrice: { read: true, show: true },
              payment: { read: true, show: true },
              totalPaid: { read: true, show: true },
              totalDues: { read: true, show: true },
              startDate: { read: true, show: true },
              endDate: { read: true, show: true },
              totalHour: { read: true, show: true },
              workDetail: { read: true, show: true },
              totalSpentHour: { read: true, show: true },
              totalRemainingHour: { read: true, show: true },
              description: { read: true, show: true },
            },
          },
          invoice: {
            access: false,
            export: false,
            create: false,
            update: false,
            delete: false,
            fields: {
              invoiceId: { read: true, show: true },
              project: { read: true, show: true },
              amount: { read: true, show: true },
              tax: { read: true, show: true },
              CGST: { read: true, show: true },
              SGST: { read: true, show: true },
              IGST: { read: true, show: true },
              total: { read: true, show: true },
              subtotal: { read: true, show: true },
              balanceDue: { read: true, show: true },
              date: { read: true, show: true },
            },
          },
          proformaInvoice: {
            access: false,
            export: false,
            create: false,
            update: false,
            delete: false,
            fields: {
              proformaInvoiceId: { read: true, show: true },
              date: { read: true, show: true },
              tax: { read: true, show: true },
              projectName: { read: true, show: true },
              projectCost: { read: true, show: true },
              clientName: { read: true, show: true },
              GSTNumber: { read: true, show: true },
              shipTo: { read: true, show: true },
              state: { read: true, show: true },
              CGST: { read: true, show: true },
              SGST: { read: true, show: true },
              IGST: { read: true, show: true },
              subtotal: { read: true, show: true },
              total: { read: true, show: true },
              balanceDue: { read: true, show: true },
            },
          },
          purchaseInvoice: {
            access: false,
            export: false,
            create: false,
            update: false,
            delete: false,
            fields: {
              name: { read: true, show: true },
              amount: { read: true, show: true },
              date: { read: true, show: true },
              bill: { read: true, show: true },
            },
          },
          projectDeployment: {
            access: false,
            export: false,
            create: false,
            update: false,
            delete: false,
            fields: {
              websiteName: { read: true, show: true },
              websiteLink: { read: true, show: true },
              client: { read: true, show: true },
              domainPurchaseDate: { read: true, show: true },
              domainExpiryDate: { read: true, show: true },
              domainExpireIn: { read: true, show: true },
              domainExpiryStatus: { read: true, show: true },
              hostingPurchaseDate: { read: true, show: true },
              hostingExpiryDate: { read: true, show: true },
              hostingExpireIn: { read: true, show: true },
              hostingExpiryStatus: { read: true, show: true },
              sslPurchaseDate: { read: true, show: true },
              sslExpiryDate: { read: true, show: true },
              sslExpireIn: { read: true, show: true },
              sslExpiryStatus: { read: true, show: true },
            },
          },
          attendance: {
            access: false,
            export: false,
            create: false,
            update: false,
            delete: false,
            fields: {
              employee: { read: true, show: true },
              holiday: { read: true, show: true },
              settings: { read: true, show: true },
            },
          },
          customer: {
            access: false,
            export: false,
            create: false,
            update: false,
            delete: false,
            fields: {
              name: { read: true, show: true },
              email: { read: true, show: true },
              mobile: { read: true, show: true },
              GSTNumber: { read: true, show: true },
              companyName: { read: true, show: true },
              state: { read: true, show: true },
              address: { read: true, show: true },
            },
          },
          team: {
            access: false,
            export: false,
            create: false,
            update: false,
            delete: false,
            fields: {
              employeeId: { read: true, show: true },
              name: { read: true, show: true },
              email: { read: true, show: true },
              mobile: { read: true, show: true },
              password: { read: true, show: true },
              joining: { read: true, show: true },
              dob: { read: true, show: true },
              monthlySalary: { read: true, show: true },
              workingHoursPerDay: { read: true, show: true },
              designation: { read: true, show: true },
              reportingTo: { read: true, show: true },
              role: { read: true, show: true },
            },
          },
          role: {
            access: false,
            export: false,
            create: false,
            update: false,
            delete: false,
            fields: {
              name: { read: true, show: true },
              permissions: { read: true, show: true },
            },
          },
          designation: {
            access: false,
            export: false,
            create: false,
            update: false,
            delete: false,
            fields: {
              name: { read: true, show: true },
              description: { read: true, show: true },
            },
          },
          department: {
            access: false,
            export: false,
            create: false,
            update: false,
            delete: false,
            fields: {
              name: { read: true, show: true },
              description: { read: true, show: true },
            },
          },
          technology: {
            access: false,
            export: false,
            create: false,
            update: false,
            delete: false,
            fields: {
              name: { read: true, show: true },
              description: { read: true, show: true },
            },
          },
          projectType: {
            access: false,
            export: false,
            create: false,
            update: false,
            delete: false,
            fields: {
              name: { read: true, show: true },
              description: { read: true, show: true },
            },
          },
          projectStatus: {
            access: false,
            export: false,
            create: false,
            update: false,
            delete: false,
            fields: {
              status: { read: true, show: true },
              description: { read: true, show: true },
            },
          },
          projectCategory: {
            access: false,
            export: false,
            create: false,
            update: false,
            delete: false,
            fields: {
              name: { read: true, show: true },
              description: { read: true, show: true },
            },
          },
          projectTiming: {
            access: false,
            export: false,
            create: false,
            update: false,
            delete: false,
            fields: {
              name: { read: true, show: true },
              description: { read: true, show: true },
            },
          },
          projectPriority: {
            access: false,
            export: false,
            create: false,
            update: false,
            delete: false,
            fields: {
              name: { read: true, show: true },
              description: { read: true, show: true },
            },
          },
        });
        toast.success("Submitted successfully");
        navigate(-1);
      }
    } catch (error) {
      console.error('Error while updating role:', error.message);
      toast.error("Error while submitting");
    };
  };

  const permissionLabels = {
    project: "Projects",
    invoice: "Tax Invoice",
    proformaInvoice: "Proforma Invoice",
    purchaseInvoice: "Purchase Invoice",
    projectDeployment: "Project Deployment",
    attendance: "Attendance",
    customer: "Client",
    team: "Employee",
    role: "Role & Permission",
    designation: "Designation",
    department: "Department",
    technology: "Technology",
    projectType: "Project Type",
    projectStatus: "Project Status",
    projectCategory: "Project Category",
    projectTiming: "Project Timeline",
    projectPriority: "Project Priority",
  };

  const inputLabel = {
    customer: "Client",
    workDetail: "Add Daily Work Summary",
    payment: "Add Received Payment",
    projectPrice: "Project Cost",
    projectTiming: "Project Timeline",
    totalPaid: "Total Received",
    technology: "Technology Used",
    CGST: "CGST",
    SGST: "SGST",
    IGST: "IGST",
    UAN: "UAN",
    PAN: "PAN",
    GSTNumber: "GST Number",
    email: "Email ID",
    mobile: "Mobile No",
    dob: "Date of Birth",
    joining: "Joining Date",
  };

  const openModal = (master) => {
    setSelectedMaster(master);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setSelectedMaster(null);
    setSelectAll(false);
    setModalIsOpen(false);
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (!permission?.update) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper custom-role" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Update Role</h4>
          <Link to="#" onClick={() => navigate(-1)}>
            <button className="btn btn-primary">Back</button>
          </Link>
        </div>
        <form onSubmit={(e) => handleUpdate(e, id)}>
          {
            (fieldPermissions?.name?.show) && (
              <div className="row mb-3">
                <div className="col-md-12">
                  <div className="form-group">
                    <label className="col-form-label" htmlFor="name">
                      Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${fieldPermissions?.name?.read ? "readonly-style" : ""}`}
                      name="name"
                      id="name"
                      value={name}
                      onChange={(e) => fieldPermissions?.name?.read ? null : setName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )
          }
          {
            (fieldPermissions?.permissions?.show) && (
              <div className="row">
                {
                  Object.keys(permissionLabels).map((master) => (
                    <div className="col-md-4 mb-3" key={master}>
                      <div className="form-group">
                        <div className="d-flex align-items-center mb-2">
                          <label className="col-form-label" style={{ marginRight: "0.5rem" }}>{permissionLabels[master]} :</label>
                          <input
                            type="checkbox"
                            className={`form-check-input ml-2 ${fieldPermissions?.permissions?.read ? "readonly-style-checkbox" : ""}`}
                            id={`${master}.access`}
                            name={`${master}.access`}
                            checked={permissions[master]?.access || false}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor={`${master}.access`} style={{ marginLeft: '5px' }}>
                            Access
                          </label>
                        </div>
                        {
                          ['export', 'create', 'update', 'delete'].map((action) => (
                            <div className="form-check" key={`${master}-${action}`}>
                              <input
                                type="checkbox"
                                className={`form-check-input ${fieldPermissions?.permissions?.read ? "readonly-style-checkbox" : ""}`}
                                id={`${master}.${action}`}
                                name={`${master}.${action}`}
                                checked={permissions[master]?.[action] || false}
                                onChange={handleChange}
                              />
                              <label className="form-check-label" htmlFor={`${master}.${action}`}>
                                {action.charAt(0).toUpperCase() + action.slice(1)}
                              </label>
                            </div>
                          ))
                        }
                        <button
                          type="button"
                          className="btn btn-sm ml-2"
                          onClick={() => openModal(master)}
                          style={{ background: "#CC8100", color: "white" }}
                        >
                          Permission
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            )
          }
          <div className="submit-button text-end">
            <Link to="#" onClick={() => navigate(-1)} className="btn btn-light sidebar-close">
              Cancel
            </Link>
            <button className="btn btn-primary" type="submit">
              Submit
            </button>
          </div>
        </form>
      </div>
      <Modal show={modalIsOpen} onHide={closeModal} size="lg" aria-labelledby="modal-title">
        <Modal.Header closeButton>
          <div style={{ display: "flex", columnGap: "1rem" }}>
            <h5>{permissionLabels[selectedMaster]} :</h5>
            <div className="form-check">
              <input
                type="checkbox"
                className={`form-check-input ${fieldPermissions?.permissions?.read ? "readonly-style-checkbox" : ""}`}
                id="selectAll"
                checked={selectAll}
                onChange={(e) => handleSelectAllChange(e, e.target.checked)}
              />
              <label style={{ fontWeight: "bold" }} className="form-check-label" htmlFor="selectAll">Select All</label>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="container">
            <div className="row">
              {
                Object.entries(permissions[selectedMaster]?.fields || {}).map(([field, permission]) => (
                  <div className="col-md-6" key={field}>
                    <div className="form-group">
                      <label className="col-form-label" style={{ marginLeft: "0rem", marginBottom: "0.2rem", }}>{inputLabel[field] || field.replace(/([A-Z])/g, " $1").trim().replace(/^./, (str) => str.toUpperCase())}{" "} :</label>
                      <div className="d-flex">
                        <div className="form-check mr-2">
                          <input
                            type="checkbox"
                            className={`form-check-input ${fieldPermissions?.permissions?.read ? "readonly-style-checkbox" : ""}`}
                            id={`${field}.read`}
                            name={`${field}.read`}
                            checked={permission.read}
                            onChange={handleFieldPermissionChange}
                          />
                          <label className="form-check-label" htmlFor={`${field}.read`}>Read Only</label>
                        </div>
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className={`form-check-input ${fieldPermissions?.name?.read ? "readonly-style-checkbox" : ""}`}
                            id={`${field}.show`}
                            name={`${field}.show`}
                            checked={permission.show}
                            onChange={handleFieldPermissionChange}
                          />
                          <label className="form-check-label" htmlFor={`${field}.show`}>Show</label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EditRole;
