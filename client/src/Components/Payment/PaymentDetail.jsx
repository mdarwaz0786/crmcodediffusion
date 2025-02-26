/* eslint-disable no-extra-semi */
/* eslint-disable react/prop-types */
import html2pdf from "html2pdf.js";
import { Link, useNavigate } from "react-router-dom";

const PaymentDetail = ({ payment }) => {
  const navigate = useNavigate();

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
        return (
          <>
            <i className="bi bi-check-circle-fill text-success fs-1"></i>
            <span className="badge bg-success ms-2 fs-6">
              ✔️ Payment Successful
            </span>
          </>
        );
      case "failed":
      case "failure":
        return (
          <>
            <i className="bi bi-x-circle-fill text-danger fs-1"></i>
            <span className="badge bg-danger ms-2 fs-6">
              ❌ Payment Failed
            </span>
          </>
        );
      case "pending":
        return (
          <>
            <i className="bi bi-exclamation-triangle-fill text-warning fs-1"></i>
            <span className="badge bg-warning text-dark ms-2 fs-6">
              ⚠️ Payment Pending
            </span>
          </>
        );
      default:
        return (
          <>
            <i className="bi bi-question-circle-fill text-secondary fs-1"></i>
            <span className="badge bg-secondary ms-2 fs-6">Unknown Status</span>
          </>
        );
    };
  };

  const exportPaymentDetailAsPdf = () => {
    const element = document.querySelector("#exportPaymentDetail");
    const options = {
      filename: `${payment?.transactionId}-${payment?.proformaInvoiceId}.pdf`,
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

  return (
    <div className="page-wrapper">
      <div className="content">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h4>Payment Detail</h4>
          <Link to="#" onClick={exportPaymentDetailAsPdf}><button className="btn btn-secondary">Download</button></Link>
          <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
        </div>
        <div className="card rounded-3" id="exportPaymentDetail">
          <div
            className={`card-header text-white text-center ${payment?.paymentStatus === "Success" ? "bg-success" : "bg-danger"
              }`}
          >
            <div className="d-flex flex-column align-items-center">
              {getStatusIcon(payment?.paymentStatus)}
              <h3 className="text-white mt-2 mb-2">Payment Details</h3>
              <h5 className="text-white">
                Status: {payment?.paymentStatus || "Unknown"}
              </h5>
            </div>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <DetailItem label="Transaction ID" value={payment?.transactionId} />
              <DetailItem label="Proforma Invoice ID" value={payment?.proformaInvoiceId} />
              <DetailItem label="Project Name" value={payment?.projectName} />
              <DetailItem label="Client Name" value={payment?.clientName} />
              <DetailItem label="Email" value={payment?.email} />
              <DetailItem label="Phone" value={payment?.phone} />
              <DetailItem label="State" value={payment?.state} />
              <DetailItem label="Shipping Address" value={payment?.shipTo} />
              <DetailItem label="Amount" value={`₹${payment?.amount}`} />
              <DetailItem label="Payment Mode" value={payment?.payUResponse?.mode} />
              <DetailItem label="Payment Date" value={payment?.paymentDate ? new Date(payment?.paymentDate).toLocaleString() : ""} />
              <DetailItem label="Bank Reference No" value={payment?.payUResponse?.bank_ref_num} />
              <DetailItem label="PayU Payment Status" value={payment?.payUResponse?.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for rendering label-value pair
const DetailItem = ({ label, value }) => (
  <div className="col-md-6">
    <div className="border rounded-2 p-3 bg-light">
      <strong>{label}:</strong>
      <p className="text-muted mb-0">{value}</p>
    </div>
  </div>
);

export default PaymentDetail;
