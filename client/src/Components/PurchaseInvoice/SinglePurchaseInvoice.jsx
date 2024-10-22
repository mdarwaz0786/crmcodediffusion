/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from 'axios';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from "../../Preloader.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const SinglePurchaseInvoice = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [filePreviews, setFilePreviews] = useState([]);
  const navigate = useNavigate();
  const { validToken, team, isLoading } = useAuth();
  const permissions = team?.role?.permissions?.purchaseInvoice;

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

        const base64Files = response?.data?.purchaseInvoice?.bill || [];
        const base64Previews = base64Files.map(file => {
          let fileType;

          if (file.startsWith('/9j/')) {
            fileType = 'image/jpeg';
          } else if (file.startsWith('iVBORw0KGgo')) {
            fileType = 'image/png';
          } else if (file.startsWith('JVBERi0x')) {
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
          <h4>Purchase Invoice</h4>
          <Link to="#" onClick={() => navigate(-1)}>
            <button className="btn btn-primary">Back</button>
          </Link>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="name">Name</label>
              <input type="text" className="form-control" name="name" id="name" value={name} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="amount">Amount</label>
              <input type="text" className="form-control" name="amount" id="amount" value={amount} />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="bill">Upload File</label>
              <input type="file" className="form-control" name="bill" id="bill" />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="date">Date</label>
              <input type="date" className="form-control" id="date" value={date} />
            </div>
          </div>
        </div>
        {/* Display the previews of selected files */}
        <div className="row">
          <div className="col-md-12">
            {
              filePreviews.length > 0 && (
                <div className="d-flex flex-wrap">
                  {
                    filePreviews.map((preview, index) => (
                      <div key={index} className="position-relative me-5 mb-3">
                        {
                          preview.startsWith('data:image/') ? (
                            // Display image preview
                            <>
                              <div className="position-relative">
                                <img src={preview} alt={`File ${index}`} style={{ width: "143px", height: "200.5px", borderRadius: "4px", objectFit: "fill" }} />
                              </div>
                              <div className="position-relative" style={{ marginTop: "0.3rem" }}>
                                <a href={preview} target="_blank" rel="noopener noreferrer" download={`File_${index}`} className="text-decoration-none">
                                  <button className="btn btn-primary">Download</button>
                                </a>
                              </div>
                            </>
                          ) : preview.startsWith('data:application/pdf') ? (
                            // Display PDF preview
                            <>
                              <div className="position-relative">
                                <embed src={preview} type="application/pdf" width="143px" height="200.5px" style={{ borderRadius: "4px", objectFit: "fill" }} />
                              </div>
                              <div className="position-relative" style={{ marginTop: "0.3rem" }}>
                                <a href={preview} target="_blank" rel="noopener noreferrer" download={`File_${index}`} className="text-decoration-none">
                                  <button className="btn btn-primary">Download</button>
                                </a>
                              </div>
                            </>
                          ) : (
                            // For other files, show as a downloadable link
                            <div className="position-relative" style={{ marginTop: "0.3rem" }}>
                              <a href={preview} target="_blank" rel="noopener noreferrer" download={`File_${index}`} className="text-decoration-none">
                                Download File
                              </a>
                            </div>
                          )
                        }
                      </div>
                    ))
                  }
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePurchaseInvoice;
