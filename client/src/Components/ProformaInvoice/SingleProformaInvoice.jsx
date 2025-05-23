/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from 'axios';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../context/authContext.jsx";
import Preloader from "../../Preloader.jsx";
import logo from '../../Assets/logo.png';
import html2pdf from "html2pdf.js";
const base_url = import.meta.env.VITE_API_BASE_URL;

const SingleProformaInvoice = () => {
  const [data, setData] = useState("");
  const { validToken, team, isLoading } = useAuth();
  const { id } = useParams();
  const permissions = team?.role?.permissions?.invoice;
  const navigate = useNavigate();

  const fetchSingleInvoicve = async (id) => {
    try {
      const response = await axios.get(`${base_url}/api/v1/proformaInvoice/single-proformaInvoice/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (response?.data?.success) {
        setData(response?.data?.invoice);
      };
    } catch (error) {
      console.log("Error while fetching single proforma invoice:", error.message);
    };
  };

  useEffect(() => {
    if (!isLoading && team && permissions?.access && id) {
      fetchSingleInvoicve(id);
    };
  }, [id, isLoading, team, permissions]);

  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  };

  const exportInvoiceAsPdf = () => {
    const element = document.querySelector("#exportProformaInvoice");
    const options = {
      filename: `${data?.proformaInvoiceId}-${data?.clientName}-Proforma-Invoice.pdf`,
      margin: [0, 0, 10, 0],
      html2canvas: {
        useCORS: true,
        scale: 4,
      },
      jsPDF: {
        orientation: 'portrait',
        format: 'a4',
        unit: 'pt',
      },
    };
    html2pdf().set(options).from(element).save();
  };

  if (isLoading) {
    return <Preloader />;
  };

  if (!permissions?.access) {
    return <Navigate to="/" />;
  };

  if (!data) {
    return <div>No data available</div>;
  };

  return (
    <div className="page-wrapper" style={{ marginBottom: "2rem" }}>
      <div className="content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4>PROFORMA INVOICE</h4>
          {
            permissions?.export && (
              <button className="btn btn-secondary" onClick={exportInvoiceAsPdf}>Download</button>
            )
          }
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <section id="exportProformaInvoice">
          <div className="bg-white" style={{ margin: '20px auto', paddingBottom: "32px" }}>
            <div className="invoice-heading">
              <div className="col-md-6">
                <div className="logo mt-4 ps-4 mb-3">
                  <img src={data?.office?.logo || logo} width="150px" alt="logo" />
                </div>
              </div>
              <div className="col-md-6 px-4">
                <div className="name d-flex mt-4 justify-content-end">
                  <h4>PROFORMA INVOICE</h4>
                </div>
              </div>
            </div>
            <div className="invoice row">
              <div className="col-md-6 p-5 pt-0">
                <div className="p-0 m-0"><strong>{data?.office?.name || "Code Diffusion Technologies"}</strong></div>
                <div>Address :</div>
                <div>{data?.office?.addressLine1 || "1020, Kirti Sikhar Tower"},</div>
                <div>{data?.office?.addressLine2 || "District Centre, Janakpuri"},</div>
                <div>{data?.office?.addressLine3 || "New Delhi"}.</div>
                <div><strong>GST No: {data?.office?.GSTNumber || "O7FRWPS7288J3ZC"}</strong></div>
              </div>
              <div className="col-md-6 p-5 pt-0">
                <div className="ubic-code d-flex justify-content-end">
                  <p className>{data?.proformaInvoiceId}</p><br />
                </div>
                <div className="date-box d-flex justify-content-end mt-5 pt-3">
                  <div className="date px-1">
                    <strong>Date:</strong>
                  </div>
                  <div className="date text-end">
                    <p>{formatDate(data?.date)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-8 p-5" style={{ display: "flex", columnGap: "1rem", }}>
                <div className="content w-100">
                  <div className="pera">
                    <h5 style={{ color: "#262a2a7a" }}>Bill To:</h5>
                    <div>
                      <strong style={{ color: "#000" }}>
                        {data?.companyName || data?.clientName}
                      </strong>
                    </div>
                    <div><strong>GST No: {data?.GSTNumber}</strong></div>
                  </div>
                </div>
                <div className="content w-100">
                  <div className="pera">
                    <h5 style={{ color: "#262a2a7a" }}>Ship To:</h5>
                    <p>
                      <strong style={{ color: "#000" }}>
                        {data?.shipTo}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 d-flex justify-content-end align-items-baseline" style={{ padding: "0 45px 0 0" }}>
                <div style={{ borderRadius: "5px", display: "inline-block", fontWeight: "bold" }} ><p>Balance Due: ₹{data?.total}</p></div>
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
                    <tr className="text-start" key={data?._id}>
                      <th scope="col">{data?.projectName}</th>
                      <th scope="col" className="ps-5">1</th>
                      <th scope="col">₹{data?.subtotal}</th>
                      <th scope="col" className="text-end">₹{data?.subtotal}</th>
                    </tr>
                  </tbody>
                  <tbody className="text-end mt-5 pt-5">
                    <tr>
                      <th scope="col" />
                      <th scope="col" />
                      <th scope="col-1">Subtotal :</th>
                      <th scope="col-2">₹{data?.subtotal}</th>
                    </tr>
                    {
                      (data?.CGST > 0) && (
                        <tr>
                          <th scope="col" />
                          <th scope="col" />
                          <th scope="col-1">CGST (9%) :</th>
                          <th scope="col-2">₹{data?.CGST}</th>
                        </tr>
                      )
                    }
                    {
                      (data?.SGST > 0) && (
                        <tr>
                          <th scope="col" />
                          <th scope="col" />
                          <th scope="col-1">SGST (9%) :</th>
                          <th scope="col-2">₹{data?.SGST}</th>
                        </tr>
                      )
                    }
                    {
                      (data?.IGST > 0) && (
                        <tr>
                          <th scope="col" />
                          <th scope="col" />
                          <th scope="col-1">IGST (18%) :</th>
                          <th scope="col-2">{data?.IGST}</th>
                        </tr>
                      )
                    }
                    <tr>
                      <th scope="col" />
                      <th scope="col" />
                      <th scope="col-1">Total :</th>
                      <th scope="col-2">₹{data?.total}</th>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-md-6 ps-4 m-0">
              <div className="p-0 pb-1 m-0 text-dark"><strong>Notes:</strong></div>
              <div className="p-0 pb-1 m-0 text-dark"><strong>Account Name: </strong>{data?.office?.accountName || "Code Diffusion Technologies"}</div>
              <div className="p-0 pb-1 m-0 text-dark"><strong>Account Type: </strong>{data?.office?.accountType || "Current Account"}</div>
              <div className="p-0 pb-1 m-0 text-dark"><strong>Account Number: </strong>{data?.office?.accountNumber || "60374584640"}</div>
              <div className="p-0 pb-1 m-0 text-dark"><strong>Bank Name: </strong>{data?.office?.bankName || "Bank of Maharashtra"}</div>
              <div className="p-0 pb-1 m-0 text-dark"><strong>IFSC Code: </strong>{data?.office?.IFSCCode || "mahb0001247"}</div>
            </div>
            <div className="col-md-6" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default SingleProformaInvoice;