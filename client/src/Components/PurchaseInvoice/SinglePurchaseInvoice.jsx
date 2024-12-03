/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-semi */
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from 'axios';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from "../../Preloader.jsx";
import jsPDF from 'jspdf';
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

  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
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
    if (!isLoading && team && permissions?.access && id) {
      fetchSinglePurchaseInvoice(id);
    };
  }, [isLoading, team, permissions, id]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    let yPos = 10; // Starting Y position for content
    const pageHeight = doc.internal.pageSize.height; // Get page height

    // Add invoice details to the PDF
    const addInvoiceDetails = () => {
      const pageWidth = doc.internal.pageSize.width; // Get page width
      const title = "Purchase Invoice";

      // Calculate the width of the text and the center position
      const textWidth = doc.getTextWidth(title);
      const xPos = (pageWidth - textWidth) / 2; // Center horizontally

      // Add centered text for Purchase Invoice
      doc.text(title, xPos, yPos);
      yPos += 10;

      // Add other details normally
      doc.text(`Name: ${name}`, 10, yPos);
      yPos += 10;
      doc.text(`Amount: ${amount}`, 10, yPos);
      yPos += 10;
      doc.text(`Date: ${formatDate(date)}`, 10, yPos);
      yPos += 20; // Add space for file previews
    };

    // Function to handle image rendering (JPEG/PNG)
    const renderImage = (preview) => {
      return new Promise((resolve, reject) => {
        if (preview.startsWith("data:image/jpeg") || preview.startsWith("data:image/png")) {
          const img = new Image();
          img.src = preview;

          // Wait for the image to load fully before processing it
          img.onload = () => {
            const imgHeight = 100;
            const imgYPos = yPos + imgHeight;

            if (imgYPos >= pageHeight) {
              doc.addPage(); // Add a new page if the image overflows
              yPos = 10; // Reset Y position for the new page
            };

            const format = preview.startsWith("data:image/jpeg") ? 'JPEG' : 'PNG';
            doc.addImage(preview, format, 10, yPos, 100, imgHeight); // Add image to PDF
            yPos += imgHeight + 10; // Update Y position after adding the image
            resolve();
          };

          img.onerror = (err) => reject(err); // Handle image load errors
        } else {
          resolve(); // Resolve if not an image
        };
      });
    };

    // Function to render other file types (e.g., PDFs or unknown types)
    const renderOtherFiles = (preview, index) => {
      if (preview.startsWith("data:application/pdf")) {
        if (yPos + 10 >= pageHeight) {
          doc.addPage(); // Add a new page if necessary
          yPos = 10;
        };
        doc.text(`PDF File ${index + 1}: See attached separately`, 10, yPos);
        yPos += 10;
      } else {
        if (yPos + 10 >= pageHeight) {
          doc.addPage(); // Add a new page if necessary
          yPos = 10;
        };
        doc.text(`File ${index + 1}: ${preview}`, 10, yPos);
        yPos += 10;
      };
    };

    // Handle all file previews
    const handlePreviews = async () => {
      for (let index = 0; index < filePreviews.length; index++) {
        const preview = filePreviews[index];

        if (preview.startsWith("data:image/jpeg") || preview.startsWith("data:image/png")) {
          try {
            await renderImage(preview, index); // Wait for image rendering
          } catch (error) {
            console.error(`Error rendering image ${index + 1}:`, error);
          };
        } else {
          renderOtherFiles(preview, index); // Handle other file types
        };
      };
      doc.save(`${date}-${name}`); // Save the document after all previews
    };

    addInvoiceDetails(); // Add the invoice details

    if (filePreviews.length > 0) {
      handlePreviews();
    } else {
      doc.save("purchase-invoice.pdf"); // Save immediately if there are no previews
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
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
          <h4>Purchase Invoice</h4>
          <button className="btn btn-secondary" onClick={downloadPDF}>Download</button>
          <Link to="#" onClick={() => navigate(-1)}>
            <button className="btn btn-primary">Back</button>
          </Link>
        </div>
        <div className="row">
          <div className="col-md-4">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="name">Name</label>
              <input type="text" className="form-control" name="name" id="name" value={name} />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-wrap">
              <label className="col-form-label" htmlFor="amount">Amount</label>
              <input type="text" className="form-control" name="amount" id="amount" value={amount} />
            </div>
          </div>
          <div className="col-md-4">
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
                          preview.startsWith("data:image/") ? (
                            // Display image preview
                            <>
                              <div className="position-relative">
                                <img
                                  src={preview}
                                  alt={`File ${index}`}
                                  style={{
                                    width: "286px",
                                    height: "401px",
                                    borderRadius: "4px",
                                    objectFit: "fill",
                                  }}
                                />
                                <div style={{ marginTop: "0.5rem" }}>
                                  <a
                                    href={preview}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={`File_${index}`}
                                  >
                                    <button className="btn btn-primary w-100">Download</button>
                                  </a>
                                </div>
                              </div>
                            </>
                          ) : preview.startsWith("data:application/pdf") ? (
                            // Display PDF preview
                            <>
                              <div className="position-relative">
                                <embed
                                  src={preview}
                                  type="application/pdf"
                                  width="286px"
                                  height="435px"
                                  style={{ borderRadius: "4px", objectFit: "cover" }}
                                />
                              </div>
                              <div className="position-relative" style={{ marginTop: "0.3rem" }}>
                                <a
                                  href={preview}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={`File_${index}`}
                                  className="text-decoration-none"
                                >
                                  <button className="btn btn-primary w-100">Download</button>
                                </a>
                              </div>
                            </>
                          ) : (
                            // For other files type, show as a downloadable link
                            <div className="position-relative" style={{ marginTop: "0.3rem" }}>
                              <a
                                href={preview}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={`File_${index}`}
                                className="text-decoration-none"
                              >
                                Download
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
