import Invoice from "../models/proformaInvoice.model.js";
import ProformaInvoiceId from "../models/proformaInvoiceId.model.js";
import puppeteer from "puppeteer";
import { transporter } from "../services/emailService.js";
import Payment from "../models/payment.model.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import formatDate from "../utils/formatDate.js";
import generatePayUHash from "../utils/generatePayUHash.js";

dotenv.config();

// Helper function to generate the next proforma invoice id
const getNextProformaInvoiceId = async () => {
  const counter = await ProformaInvoiceId.findOneAndUpdate(
    { _id: "proformaInvoiceId" },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true },
  );
  return `#CD${1818 + counter.sequence}`;
};

// Controller for creating an invoice
export const createInvoice = async (req, res) => {
  try {
    const { date, tax, projectName, projectCost, clientName, GSTNumber, state, shipTo, email, phone } = req.body;

    let subtotal = parseFloat(projectCost);
    let CGST = 0;
    let SGST = 0;
    let IGST = 0;
    let total = 0;

    if (tax === "Inclusive") {
      subtotal = subtotal / 1.18;
    };

    if (state === "Delhi") {
      CGST = subtotal * 0.09;
      SGST = subtotal * 0.09;
      total = subtotal + CGST + SGST;
    } else {
      IGST = subtotal * 0.18;
      total = subtotal + IGST;
    };

    const invoiceDate = date ? new Date(date) : new Date();

    const newInvoice = new Invoice({
      date: invoiceDate,
      tax,
      projectName,
      projectCost: projectCost,
      clientName,
      email,
      phone,
      GSTNumber,
      state,
      shipTo,
      subtotal: subtotal.toFixed(2),
      CGST: CGST.toFixed(2),
      SGST: SGST.toFixed(2),
      IGST: IGST.toFixed(2),
      total: total.toFixed(2),
      balanceDue: total.toFixed(2),
    });

    const proformaInvoiceId = await getNextProformaInvoiceId();

    newInvoice.proformaInvoiceId = proformaInvoiceId;

    // Read the logo file and convert it to Base64
    const __dirname = path.resolve();
    const logoPath = path.join(__dirname, 'public/assets/logo.png');
    const logoBase64 = fs.readFileSync(logoPath).toString('base64');
    const logoSrc = `data:image/png;base64,${logoBase64}`;

    // Generate the salary slip HTML
    const salarySlipHTML = `
    <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice</title>
    <style>
      * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
    }

    .content {
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .invoice-container {
      background-color: white;
    }

    .invoice-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
    }

    .logo img {
      width: 150px;
      margin-bottom: 10px;
    }

    .invoice-title h4 {
      font-size: 18px;
    }

    .invoice-details {
      display: flex;
      justify-content: space-between;
      padding: 0 20px;
    }

    .invoice-id {
      margin-bottom: 5px;
    }

    .billing-info div {
      margin-bottom: 5px;
    }

    .row {
      display: flex;
      justify-content: space-between;
      padding: 20px;
      margin-top: 20px;
    }

    .row div {
      margin-bottom: 5px;
    }

    .invoice-table {
      width: 100%;
      margin-top: 20px;
      border-collapse: collapse;
    }

    .invoice-table th,
    .invoice-table td {
      text-align: left;
    }

    .invoice-table th {
      padding: 10px 20px;
      background-color: #dcf0f0 !important;
      color: #000 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .invoice-table td {
      padding: 8px 20px;
    }

    .invoice-table th.text-end,
    .invoice-table td.text-end {
      text-align: right;
    }

    .notes {
      padding: 20px;
    }

    .notes div {
      padding-bottom: 5px;
    }
  </style>
</head>

<body>
  <div class="content">
    <div class="invoice-container">
      <div class="invoice-heading">
        <div class="logo">
          <img src="${logoSrc}" alt="logo">
        </div>
        <div class="invoice-title">
          <h4>PROFORMA INVOICE</h4>
        </div>
      </div>
      <div class="invoice-details">
        <div class="billing-info">
          <div><strong>Code Diffusion Technologies</strong></div>
          <div>Address:</div>
          <div>1020, Kirti Sikhar Tower,</div>
          <div>District Centre, Janakpuri,</div>
          <div>New Delhi.</div>
          <div><strong>GST No: O7FRWPS7288J3ZC</strong></div>
        </div>
        <div class="invoice-meta">
          <div class="invoice-id">Invoice ID: <strong>${proformaInvoiceId}</strong></div>
          <div class="invoice-date">
            <strong>Date:</strong>
            <span>${formatDate(date)}</span>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="billing-address">
          <div><strong>Bill To:</strong></div>
          <div>${clientName}</div>
          <div><strong>GST No: ${GSTNumber}</strong></div>
        </div>
        <div class="shipping-address">
          <div><strong>Ship To:</strong></div>
          <div>${shipTo}</div>
        </div>
        <div class="balance-due">
          <p><strong>Balance Due: ₹${total.toFixed(2)}</strong></p>
        </div>
      </div>
      <table class="invoice-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th class="text-end">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${projectName}</td>
            <td>1</td>
            <td>₹${subtotal}</td>
            <td class="text-end">₹${subtotal}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
            <td class="text-end">₹${subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right;"><strong>CGST (9%):</strong></td>
            <td class="text-end">₹${CGST.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right;"><strong>SGST (9%):</strong></td>
            <td class="text-end">₹${SGST.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right;"><strong>IGST (18%):</strong></td>
            <td class="text-end">₹${IGST.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
            <td class="text-end">₹${total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <div class="notes">
        <div><strong>Notes:</strong></div>
        <div><strong>Account Name: </strong>Code Diffusion Technologies</div>
        <div><strong>Account Type: </strong>Current Account</div>
        <div><strong>Account Number: </strong>60374584640</div>
        <div><strong>Bank Name: </strong>Bank of Maharashtra</div>
        <div><strong>IFSC Code: </strong>mahb0001247</div>
      </div>
    </div>
  </div>
</body>

</html>
    `;

    const txnid = `TXN${Date.now()}`;
    const key = process.env.PAYU_MERCHANT_KEY;
    const salt = process.env.PAYU_SALT;
    const amount = total;
    const productinfo = projectName;
    const firstname = clientName;
    const surl = process.env.PAYU_SUCCESS_URL;
    const furl = process.env.PAYU_FAILURE_URL;
    const serverUrl = process.env.SERVER_URL;

    const hash = generatePayUHash({
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      salt,
    });

    // Store initial payment data
    const newPayment = new Payment({
      proformaInvoiceId: proformaInvoiceId,
      projectName,
      projectCost,
      clientName,
      email,
      phone,
      GSTNumber,
      state,
      shipTo,
      tax,
      amount: total.toFixed(2),
      transactionId: txnid,
      paymentStatus: "Pending",
    });

    const paymentLink = `${serverUrl}/api/v1/payment/payu-payment?key=${key}&txnid=${txnid}&amount=${amount}&productinfo=${encodeURIComponent(
      productinfo
    )}&firstname=${encodeURIComponent(firstname)}&email=${encodeURIComponent(
      email
    )}&phone=${phone}&surl=${surl}&furl=${furl}&hash=${hash}`;

    const emailHTML = `
  <p>Dear ${clientName},</p>
  <p>We hope you are doing well.</p>
  <p>Please find attached the proforma invoice for your reference. The invoice outlines the details of the services/products discussed, including pricing and terms.</p>
  <p>Kindly review the invoice and let us know if you have any questions or require further clarification.</p>
  <p>To make a payment, please click the link below:</p>
  <p><a href="${paymentLink}" style="background-color:#28a745;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Pay Now</a></p>
  <p>We look forward to proceeding with the next steps upon your confirmation.</p>
  <p>Best regards,</p>
  <p>Abhishek Singh<br/>
  Code Diffusion Technologies<br/>
  +91 7827114607<br/>
  info@codediffusion.in<br/>
  <a href="https://www.codediffusion.in/">https://www.codediffusion.in/</a>
`;

    // Generate PDF from HTML
    const browser = await puppeteer.launch(
      {
        headless: true,
        executablePath: '/root/.cache/puppeteer/chrome/linux-133.0.6943.98/chrome-linux64/chrome',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
        ],
      }
    );
    const page = await browser.newPage();
    await page.setContent(salarySlipHTML);
    const pdfPath = `proforma_invoice_${proformaInvoiceId}.pdf`;
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, });
    await browser.close();

    // Email options
    const mailOptions = {
      from: `${process.env.SENDER_EMAIL_ID}`,
      to: `${email}`,
      subject: `Proforma Invoice from Code Diffusion Technologies - ${formatDate(date)}`,
      html: emailHTML,
      attachments: [
        {
          filename: pdfPath,
          path: pdfPath,
        },
      ],
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Save the invoice record
    await newInvoice.save();

    // Save the payment record
    await newPayment.save();

    // Cleanup the generated PDF
    fs.unlinkSync(pdfPath);

    return res.status(200).json({ success: true, message: "Proforma invoice created successfully", invoice: newInvoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Controller for fetching all proforma invoice
export const fetchAllInvoice = async (req, res) => {
  try {
    let filter = {};
    let sort = {};

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter = {
        $or: [
          { proformaInvoiceId: searchRegex },
          { clientName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { GSTNumber: searchRegex },
          { state: searchRegex },
          { shipTo: searchRegex },
          { tax: searchRegex },
          { date: searchRegex },
          { projectName: searchRegex },
        ],
      };
    };

    if (req.query.nameSearch) {
      filter.proformaInvoiceId = { $regex: new RegExp(req.query.nameSearch, 'i') };
    };

    if (req.query.nameFilter) {
      filter.proformaInvoiceId = {
        $in: Array.isArray(req.query.nameFilter) ? req.query.nameFilter : [req.query.nameFilter]
      };
    };

    // Handle year-wise filtering
    if (req.query.year && !req.query.month) {
      const year = parseInt(req.query.year);

      // Start of the year (January 1st) and end of the year (December 31st)
      const startDate = new Date(year, 0, 1); // January 1st
      const endDate = new Date(year + 1, 0, 0); // December 31st (last day of the year)

      filter.date = {
        $gte: startDate,
        $lt: endDate
      };
    };

    // Handle month-wise filtering (ignore year)
    if (req.query.month && !req.query.year) {
      const month = parseInt(req.query.month);

      filter.date = {
        $gte: new Date(new Date().getFullYear(), month - 1, 1),  // Start of the month
        $lt: new Date(new Date().getFullYear(), month, 1)        // Start of the next month (non-inclusive)
      };
    };

    // Handle both year and month filtering
    if (req.query.year && req.query.month) {
      const year = parseInt(req.query.year);
      const month = parseInt(req.query.month);

      // Start of the month and end of the month
      const startDate = new Date(year, month - 1, 1); // 1st day of the month
      const endDate = new Date(year, month, 0); // Last day of the month

      filter.date = {
        $gte: startDate,
        $lt: endDate
      };
    };

    sort = req.query.sort === 'Ascending' ? { createdAt: 1 } : { createdAt: -1 };

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const proformaInvoices = await Invoice
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!proformaInvoices) {
      return res.status(404).json({ success: false, message: "Proforma invoices not found" });
    };

    const totalCount = await Invoice.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "Proforma invoices fetched successfully",
      invoice: proformaInvoices,
      totalCount,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Error while fetching proforma invoice", error: error.message });
  };
};

// Controller for fetching a single invoice
export const fetchSingleInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId).exec();

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    };

    return res.status(200).json({ success: true, message: "Single invoice fetched successfully", invoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error while fetching single invoice", error: error.message });
  };
};

// Controller for updating an invoice by ID
export const updateInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const { date, tax, projectName, projectCost, clientName, GSTNumber, state, shipTo, email, phone } = req.body;

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Proforma invoice not found" });
    };

    let subtotal = parseFloat(projectCost);
    let CGST = 0;
    let SGST = 0;
    let IGST = 0;
    let total = 0;

    if (tax === "Inclusive") {
      subtotal = subtotal / 1.18;
    };

    if (state === "Delhi") {
      CGST = subtotal * 0.09;
      SGST = subtotal * 0.09;
      total = subtotal + CGST + SGST;
    } else {
      IGST = subtotal * 0.18;
      total = subtotal + IGST;
    };

    const invoiceDate = date ? new Date(date) : new Date();

    invoice.date = invoiceDate;
    invoice.tax = tax;
    invoice.projectName = projectName;
    invoice.projectCost = projectCost;
    invoice.clientName = clientName;
    invoice.email = email;
    invoice.phone = phone;
    invoice.GSTNumber = GSTNumber;
    invoice.state = state;
    invoice.shipTo = shipTo;
    invoice.subtotal = subtotal.toFixed(2);
    invoice.CGST = CGST.toFixed(2);
    invoice.SGST = SGST.toFixed(2);
    invoice.IGST = IGST.toFixed(2);
    invoice.total = total.toFixed(2);
    invoice.balanceDue = total.toFixed(2);

    await invoice.save();

    return res.status(200).json({ success: true, message: "Proforma invoice updated successfully", invoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while updating proforma invoice: ${error.message}` });
  };
};

// Controller for deleting an invoice by ID
export const deleteInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await Invoice.findByIdAndDelete(invoiceId);

    if (!invoice) {
      return res.status(400).json({ success: false, message: "Invoice not found" });
    };

    return res.status(200).json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error while deleting invoice", error: error.message });
  };
};
