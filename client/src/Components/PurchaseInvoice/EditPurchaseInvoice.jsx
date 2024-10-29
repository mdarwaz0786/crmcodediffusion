/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from "../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const EditPurchaseInvoice = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();
  const permissions = team?.role?.permissions?.purchaseInvoice;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);

    // Reset file input field
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    };
  };

  const fetchSinglePurchaseInvoice = async (id) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/purchaseInvoice/single-purchaseInvoice/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setName(response?.data?.purchaseInvoice?.name);
        setAmount(response?.data?.purchaseInvoice?.amount);
        setDate(response?.data?.purchaseInvoice?.date);

        // Handle Base64 files from the response
        const base64Files = response?.data?.purchaseInvoice?.bill || [];
        const base64Previews = base64Files?.map((file) => {
          let fileType;

          if (file?.startsWith('/9j/')) {
            fileType = 'image/jpeg';
          } else if (file?.startsWith('iVBORw0KGgo')) {
            fileType = 'image/png';
          } else if (file?.startsWith('JVBERi0x')) {
            fileType = 'application/pdf';
          };
          return `data:${fileType};base64,${file}`;
        });

        setFilePreviews(base64Previews);
      };
    } catch (error) {
      console.log("Error while fetching single purchase invoice:", error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.update && id) {
      fetchSinglePurchaseInvoice(id);
    };
  }, [isLoading, team, permissions, id]);

  const removeFile = (index) => {
    const updatedFiles = files?.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("amount", amount);
      formData.append("date", date);

      for (let i = 0; i < files?.length; i++) {
        formData.append("bills", files[i]);
      };

      const response = await axios.put(`${base_url}/api/v1/purchaseInvoice/update-purchaseInvoice/${id}`, formData, {
        headers: {
          Authorization: validToken,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response?.data?.success) {
        setName("");
        setAmount("");
        setFiles([]);
        setFilePreviews([]);

        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        };

        toast.success("Submitted Successfully");
        navigate(-1);
      };
    } catch (error) {
      console.log("Error while creating purchase invoice:", error.message);
      toast.error("Error while creating");
    };
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (!permissions?.create) {
    return <Navigate to="/" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Edit Purchase Invoice</h4>
          <Link to="#" onClick={() => navigate(-1)}>
            <button className="btn btn-primary">Back</button>
          </Link>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="name">Name</label>
              <input type="text" className="form-control" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="amount">Amount</label>
              <input type="text" className="form-control" name="amount" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="bill">Upload File</label>
              <input type="file" className="form-control" name="bill" id="bill" multiple onChange={handleFileChange} ref={fileInputRef} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="date">Date</label>
              <input type="date" className="form-control" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
        </div>
        {/* Display the previews of existing files */}
        <div className="row">
          <div className="col-md-12">
            {
              filePreviews?.length > 0 && (
                <div className="d-flex flex-wrap">
                  {
                    filePreviews?.map((preview, index) => (
                      <div key={index} className="position-relative me-5 mb-3">
                        {
                          preview?.startsWith('data:image/') ? (
                            // Display image preview
                            <div className="position-relative">
                              <img src={preview} alt={`File ${index}`} style={{ width: "143px", height: "200.5px", borderRadius: "4px", objectFit: "fill" }} />
                            </div>
                          ) : preview?.startsWith('data:application/pdf') ? (
                            // Display PDF preview
                            <div className="position-relative">
                              <embed src={preview} type="application/pdf" width="143px" height="200.5px" style={{ borderRadius: "4px", objectFit: "fill" }} />
                            </div>
                          ) : (
                            // For other files type, show as a downloadable link
                            <div className="position-relative">
                              <a href={preview} target="_blank" rel="noopener noreferrer" className="text-decoration-none">{preview?.name}</a>
                            </div>
                          )
                        }
                      </div>
                    ))
                  }
                </div>
              )
            }
            {/* Display the previews of new selected files */}
            {
              files?.length > 0 && (
                <>
                  <h4 className="mb-3 mt-3">New File</h4>
                  <div className="d-flex flex-wrap">
                    {
                      files?.map((file, index) => (
                        <div key={index} className="position-relative me-5 mb-3">
                          {
                            file?.type?.startsWith("image/") ? (
                              // Display image preview
                              <div className="position-relative">
                                <img src={filePreviews[index]} alt={file?.name} style={{ width: "143px", height: "200.5px", borderRadius: "4px", objectFit: "fill" }} />
                                <button className="btn btn-danger btn-sm position-absolute top-0" onClick={() => removeFile(index)} style={{ right: "0", zIndex: 1 }}>
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </div>
                            ) : file?.type === "application/pdf" ? (
                              // Display PDF preview
                              <div className="position-relative">
                                <embed src={filePreviews[index]} type="application/pdf" width="143px" height="200.5px" style={{ borderRadius: "4px", objectFit: "fill" }} />
                                <button className="btn btn-danger btn-sm position-absolute top-0" onClick={() => removeFile(index)} style={{ right: "0", zIndex: 1 }}>
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </div>
                            ) : (
                              // For other files type, show as a downloadable link
                              <div className="position-relative">
                                <a href={URL.createObjectURL(file)} target="_blank" rel="noopener noreferrer" className="text-decoration-none">{file?.name}</a>
                                <button className="btn btn-danger btn-sm position-absolute top-0" onClick={() => removeFile(index)} title="Remove file" style={{ right: "0", zIndex: 1 }}>
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </div>
                            )
                          }
                        </div>
                      ))
                    }
                  </div>
                </>
              )
            }
          </div>
        </div>
        <div className="submit-button text-end">
          <Link to="#" onClick={() => navigate(-1)} className="btn btn-light">Cancel</Link>
          <Link to="#" className="btn btn-primary" onClick={(e) => handleUpdate(e, id)}>Submit</Link>
        </div>
      </div>
    </div>
  );
};

export default EditPurchaseInvoice;
