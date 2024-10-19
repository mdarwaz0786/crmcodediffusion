/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from 'axios';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from "../../Preloader.jsx";
import logo from '../../Assets/logo.png';
import html2pdf from "html2pdf.js";
import JSZip from "jszip";
import FileSaver from "file-saver";
const base_url = import.meta.env.VITE_API_BASE_URL;

const InvoiceZip = () => {
  const [invoices, setInvoices] = useState([]);
  const { validToken, team, isLoading } = useAuth();
  const permissions = team?.role?.permissions?.invoice;
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${base_url}/api/v1/invoice/all-invoice`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setInvoices(response?.data?.invoice);
      };
    } catch (error) {
      console.log("Error while fetching invoices:", error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.access) {
      fetchInvoices();
    }
  }, [isLoading, team, permissions]);

  if (isLoading) {
    return <Preloader />;
  };

  if (!permissions?.access) {
    return <Navigate to="/" />;
  };

  const generatePDFsAndZip = async () => {
    const zip = new JSZip();

    // Generate PDFs for each invoice
    for (const invoice of invoices) {
      const element = document.querySelector(`#invoice-${invoice?._id}`);
      const pdfOptions = {
        filename: `${invoice?.invoiceId}-${invoice?.projects[0]?.project?.customer?.companyName}.pdf`,
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
      zip.file(`${invoice?.invoiceId}-${invoice?.projects[0]?.project?.customer?.companyName}.pdf`, pdfBlob);
    };

    // Generate the ZIP file and save it
    const content = await zip.generateAsync({ type: "blob" });
    FileSaver.saveAs(content, "tax-invoices.zip");
  };

  if (!invoices || invoices?.length === 0) {
    return <div>No invoices available</div>;
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4>Invoices</h4>
          {
            permissions?.export && (
              <button className="btn btn-secondary" onClick={generatePDFsAndZip}>Download</button>
            )
          }
          <Link to="#"><button className="btn btn-primary" onClick={() => navigate(-1)}>Back</button></Link>
        </div>
        <section>
          {
            invoices?.map((invoice) => (
              <div key={invoice?._id} id={`invoice-${invoice?._id}`} className="bg-white" style={{ margin: '32px auto', paddingBottom: "32px" }}>
                {/* Invoice Header */}
                <div className="invoice-heading">
                  <div className="col-md-6">
                    <div className="logo mt-4">
                      <img src={logo} width="250px" alt="logo" />
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
                    <div className="p-0 m-0"><strong>Code Diffusion Technologies</strong></div>
                    <div>Address :</div>
                    <div>1020 , Kirti Sikhar Tower,</div>
                    <div>District Centre, Janakpuri,</div>
                    <div>New Delhi.</div>
                    <div><strong>GST No: O7FRWPS7288J3Z</strong></div>
                  </div>
                  <div className="col-md-6 p-5 pt-0">
                    <div className="ubic-code d-flex justify-content-end">
                      <p>{invoice.invoiceId}</p><br />
                    </div>
                    <div className="date-box d-flex justify-content-end mt-5 pt-3">
                      <div className="date px-2">
                        <strong>Date:</strong>
                      </div>
                      <div className="date text-end">
                        <p>{invoice?.date}</p>
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
                            {invoice?.projects[0]?.project?.customer?.companyName}
                          </strong>
                        </div>
                        <div><strong>GST No: {invoice?.projects[0]?.project?.customer?.GSTNumber}</strong></div>
                      </div>
                    </div>
                    <div className="content w-100">
                      <div className="pera">
                        <h5 style={{ color: "#262a2a7a" }}>Ship To:</h5>
                        <p>
                          <strong style={{ color: "#000" }}>
                            {invoice?.projects[0]?.project?.customer?.address}
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
                              <th scope="col">{d?.project?.projectName}</th>
                              <th scope="col" className="ps-5">1</th>
                              <th scope="col">₹{d?.amount}</th>
                              <th scope="col" className="text-end">₹{d?.amount}</th>
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
                  <div className="p-0 pb-1 m-0 text-dark"><strong>Account Name: </strong>Code Diffusion Technologies </div>
                  <div className="p-0 pb-1 m-0 text-dark"><strong>Account Type: </strong>Current Account</div>
                  <div className="p-0 pb-1 m-0 text-dark"><strong>Account Number: </strong>60374584640</div>
                  <div className="p-0 pb-1 m-0 text-dark"><strong>Bank Name: </strong>Bank of Maharashtra</div>
                  <div className="p-0 pb-1 m-0 text-dark"><strong>IFSC Code: </strong>mahb0001247</div>
                </div>
                <div className="col-md-6" />
              </div>
            ))
          }
        </section>
      </div>
    </div>
  );
};

export default InvoiceZip;
