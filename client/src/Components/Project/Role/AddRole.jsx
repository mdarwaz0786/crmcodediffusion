/* eslint-disable no-extra-semi */
import { useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from "../../../context/authContext.jsx";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Preloader from "../../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const AddRole = () => {
  const { validToken, team, isLoading } = useAuth();
  const permission = team?.role?.permissions?.role;
  const [selectAll, setSelectAll] = useState(true);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const navigate = useNavigate();
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
        projects: { read: true, show: true },
        quantity: { read: true, show: true },
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
        projects: { read: true, show: true },
        quantity: { read: true, show: true },
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
    purchaseInvoice: {
      access: false,
      export: false,
      create: false,
      update: false,
      delete: false,
      fields: {
        name: { read: true, show: true },
        amount: { read: true, show: true },
      },
    },
    // attendance: {
    //   access: false,
    //   export: false,
    //   create: false,
    //   update: false,
    //   delete: false,
    //   fields: {
    //     employee: { read: true, show: true },
    //     markedBy: { read: true, show: true },
    //     attendance: { read: true, show: true },
    //     date: { read: true, show: true },
    //     checkInTime: { read: true, show: true },
    //     checkOutTime: { read: true, show: true },
    //     totalHoursWorked: { read: true, show: true },
    //   },
    // },
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

  const handleSelectAllChange = (checked) => {
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

  const handleCreate = async (e) => {
    e.preventDefault();

    // Validation
    if (!name) {
      return toast.error("Enter name");
    };

    try {
      const response = await axios.post(`${base_url}/api/v1/role/create-role`, { name, permissions }, {
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
              projects: { read: true, show: true },
              quantity: { read: true, show: true },
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
              projects: { read: true, show: true },
              quantity: { read: true, show: true },
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
          purchaseInvoice: {
            access: false,
            export: false,
            create: false,
            update: false,
            delete: false,
            fields: {
              name: { read: true, show: true },
              amount: { read: true, show: true },
            },
          },
          // attendance: {
          //   access: false,
          //   export: false,
          //   create: false,
          //   update: false,
          //   delete: false,
          //   fields: {
          //     employee: { read: true, show: true },
          //     markedBy: { read: true, show: true },
          //     attendance: { read: true, show: true },
          //     date: { read: true, show: true },
          //     checkInTime: { read: true, show: true },
          //     checkOutTime: { read: true, show: true },
          //     totalHoursWorked: { read: true, show: true },
          //   },
          // },
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
        toast.success("Submitted Successfully");
        navigate(-1);
      };
    } catch (error) {
      console.error('Error while creating role:', error.message);
      toast.error("Error while creating");
    };
  };

  const permissionLabels = {
    project: "Projects",
    invoice: "Tax Invoice",
    proformaInvoice: "Proforma Invoice",
    purchaseInvoice: "Purchase Invoice",
    // attendance: "Attendance",
    customer: "Client",
    team: "Employee",
    role: "Role & Permission",
    designation: "Designation",
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
    setSelectAll(true);
    setModalIsOpen(false);
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (!permission?.create) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper custom-role" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Add Role</h4>
          <Link to="#" onClick={() => navigate(-1)}>
            <button className="btn btn-primary">Back</button>
          </Link>
        </div>
        <form onSubmit={handleCreate}>
          <div className="row mb-3">
            <div className="col-md-12">
              <div className="form-group">
                <label className="col-form-label" htmlFor="name">
                  Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="row">
            {
              Object.keys(permissionLabels).map((master) => (
                <div className="col-md-4 mb-3" key={master}>
                  <div className="form-group">
                    <div className="d-flex align-items-center mb-2">
                      <label className="col-form-label" style={{ marginRight: "0.5rem" }}>{permissionLabels[master]} :</label>
                      <input
                        type="checkbox"
                        className="form-check-input ml-2"
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
                            className="form-check-input"
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
                      Input Field Permission
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
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
                className="form-check-input"
                id="selectAll"
                checked={selectAll}
                onChange={(e) => handleSelectAllChange(e.target.checked)}
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
                            className="form-check-input"
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
                            className="form-check-input"
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

export default AddRole;
