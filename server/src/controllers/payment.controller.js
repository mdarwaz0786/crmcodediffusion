import Payment from "../models/payment.model.js";
import Invoice from "../models/invoice.model.js";
import axios from "axios";
import dotenv from "dotenv";
import nodemailer from 'nodemailer';
import crypto from "crypto";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import formatDate from "../utils/formatDate.js";

dotenv.config();

export const paymentSuccess = async (req, res) => {
  const { txnid } = req.body;
  const key = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_SALT;

  const date = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const [day, month, year] = date.split(",")[0].split("/");
  const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

  try {
    // ✅ Create hash for verification
    const hashString = `${key}|verify_payment|${txnid}|${salt}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    // ✅ Prepare payload for PayU verification API
    const payload = new URLSearchParams({
      key,
      command: "verify_payment",
      hash,
      var1: txnid,
    });

    // ✅ Make request to PayU
    const response = await axios.post(
      "https://info.payu.in/merchant/postservice?form=2",
      payload.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    const payUResponse = response.data;

    // ✅ Check if transaction details are present
    if (!payUResponse.transaction_details || !payUResponse.transaction_details[txnid]) {
      return res.status(400).render("paymentFailure", {
        txnid,
        status: "Transaction details missing",
        reason: "Invalid transaction details received from PayU.",
        date,
      });
    };

    const transactionDetails = payUResponse.transaction_details[txnid];

    // ✅ If payment successful
    if (payUResponse.status === 1 && transactionDetails.status === "success") {
      const updatedPayment = await Payment.findOneAndUpdate(
        { transactionId: txnid },
        {
          paymentStatus: "Success",
          paymentDate: date,
          payUResponse,
        },
        { new: true },
      );

      if (!updatedPayment) {
        return res.status(404).render("paymentFailure", {
          txnid,
          status: "Record not found",
          reason: "Payment record not found in the database.",
          date,
        });
      };

      const paymentDetail = await Payment
        .findOne({ transactionId: txnid })
        .populate("office")
        .exec();

      const proformaInvoiceDetails = {
        proformaInvoiceId: paymentDetail?.proformaInvoiceId,
        proformaInvoiceDate: paymentDetail?.proformaInvoiceDate,
        transactionId: paymentDetail?.transactionId,
        projectName: paymentDetail?.projectName,
        projectCost: paymentDetail?.projectCost,
        email: paymentDetail?.email,
        phone: paymentDetail?.phone,
        clientName: paymentDetail?.clientName,
        companyName: paymentDetail?.companyName,
        GSTNumber: paymentDetail?.GSTNumber,
        state: paymentDetail?.state,
        shipTo: paymentDetail?.shipTo,
      };

      const invoiceId = Date.now();

      const newInvoice = new Invoice({
        invoiceId,
        tax: paymentDetail?.tax,
        date: formattedDate,
        office: paymentDetail?.office?._id,
        amount: paymentDetail?.projectCost,
        subtotal: paymentDetail?.subtotal,
        CGST: paymentDetail?.CGST,
        SGST: paymentDetail?.SGST,
        IGST: paymentDetail?.IGST,
        total: paymentDetail?.amount,
        balanceDue: paymentDetail?.amount,
        proformaInvoiceDetails,
      });

      // Read the logo file and convert it to Base64
      const __dirname = path.resolve();
      const logoPath = path.join(__dirname, 'public/assets/logo.png');
      const logoBase64 = fs.readFileSync(logoPath).toString('base64');
      const logoSrc = `data:image/png;base64,${logoBase64}`;

      // Generate the tax invoice HTML
      const taxInvoiceHTML = `
    <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice</title>
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
          <img src="${paymentDetail?.office?.logo || logoSrc}" alt="logo">
        </div>
        <div class="invoice-title">
          <h4>TAX INVOICE</h4>
        </div>
      </div>
      <div class="invoice-details">
        <div class="billing-info">
          <div><strong>${paymentDetail?.office?.name}</strong></div>
          <div>Address:</div>
          <div>${paymentDetail?.office?.addressLine1},</div>
          <div>${paymentDetail?.office?.addressLine2},</div>
          <div>${paymentDetail?.office?.addressLine3}.</div>
          <div><strong>GST No: ${paymentDetail?.GSTNumber}</strong></div>
        </div>
        <div class="invoice-meta">
          <div class="invoice-id">Invoice ID: <strong>${invoiceId}</strong></div>
          <div class="invoice-date">
            <strong>Date:</strong>
            <span>${formatDate(formattedDate)}</span>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="billing-address">
          <div><strong>Bill To:</strong></div>
          <div>${paymentDetail?.companyName || paymentDetail?.clientName}</div>
          <div><strong>GST No: ${paymentDetail?.GSTNumber}</strong></div>
        </div>
        <div class="shipping-address">
          <div><strong>Ship To:</strong></div>
          <div>${paymentDetail?.shipTo}</div>
        </div>
        <div class="balance-due">
          <p><strong>Balance Due: ₹${paymentDetail?.amount}</strong></p>
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
            <td>${paymentDetail?.projectName}</td>
            <td>1</td>
            <td>₹${paymentDetail?.subtotal}</td>
            <td class="text-end">₹${paymentDetail?.subtotal}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
            <td class="text-end">₹${paymentDetail?.subtotal}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right;"><strong>CGST (9%):</strong></td>
            <td class="text-end">₹${paymentDetail?.CGST}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right;"><strong>SGST (9%):</strong></td>
            <td class="text-end">₹${paymentDetail?.SGST}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right;"><strong>IGST (18%):</strong></td>
            <td class="text-end">₹${paymentDetail?.IGST}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
            <td class="text-end">₹${paymentDetail?.amount}</td>
          </tr>
        </tfoot>
      </table>
      <div class="notes">
        <div><strong>Notes:</strong></div>
        <div><strong>Account Name: </strong>${paymentDetail?.office?.accountName || "Code Diffusion Technologies"}</div>
        <div><strong>Account Type: </strong>${paymentDetail?.office?.accountType || "Current Account"}</div>
        <div><strong>Account Number: </strong>${paymentDetail?.office?.accountNumber || "60374584640"}</div>
        <div><strong>Bank Name: </strong>${paymentDetail?.office?.bankName || "Bank of Maharashtra"}</div>
        <div><strong>IFSC Code: </strong>${paymentDetail?.office?.IFSCCode || "mahb0001247"}</div>
      </div>
    </div>
  </div>
</body>

</html>
    `;

      // Generate PDF from HTML
      const browser = await puppeteer.launch({
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
      });
      const page = await browser.newPage();
      await page.setContent(taxInvoiceHTML);
      const pdfPath = `tax_invoice_${invoiceId}.pdf`;
      await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, });
      await browser.close();

      // Email options
      const mailOptions = {
        from: paymentDetail?.office?.noReplyEmail || process.env.SENDER_EMAIL_ID,
        to: paymentDetail?.email,
        subject: `Tax Invoice from ${paymentDetail?.office?.name || "Code Diffusion Technologies"}  - ${formatDate(formattedDate)}`,
        text: `Dear ${paymentDetail?.clientName},

We hope you’re doing well.

Please find attached the tax invoice for the services/products provided by ${paymentDetail?.office?.name || "Code Diffusion Technologies"}. The invoice includes a detailed breakdown of charges, applicable taxes, and payment terms for your reference.

Kindly review the invoice and let us know if you have any questions or need further assistance. If everything is in order, we would appreciate it if you could process the payment by the due date mentioned in the invoice.

Thank you for choosing ${paymentDetail?.office?.name || "Code Diffusion Technologies"} . We look forward to continuing our collaboration.

Best regards,  
Abhishek Singh  
${paymentDetail?.office?.name || "Code Diffusion Technologies"} 
${paymentDetail?.office?.contact || "+91-7827114607"}
${paymentDetail?.office?.email || "info@codediffusion.in"}
${paymentDetail?.office?.websiteLink || "https://www.codediffusion.in/"}`,
        attachments: [
          {
            filename: pdfPath,
            path: pdfPath,
          },
        ],
      };

      // Create a transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: paymentDetail?.office?.noReplyEmail || process.env.SENDER_EMAIL_ID,
          pass: paymentDetail?.office?.noReplyEmailAppPassword || process.env.SENDER_EMAIL_APP_PASSWORD,
        },
      });

      // Send the email
      await transporter.sendMail(mailOptions);

      // Save the invoice record
      await newInvoice.save();

      // Cleanup the generated PDF
      fs.unlinkSync(pdfPath);

      return res.status(200).render("paymentSuccess", {
        txnid,
        amount: transactionDetails.amt,
        date,
      });
    } else {
      // ❌ Payment failed
      return res.status(400).render("paymentFailure", {
        txnid,
        status: transactionDetails.status,
        reason: transactionDetails.error_Message || "Unknown reason",
        date,
      });
    };
  } catch (error) {
    // ❌ Handle errors properly
    return res.status(500).render("paymentFailure", {
      txnid,
      status: "Internal Server Error",
      reason: error.response?.data?.message || error.message || "Something went wrong.",
      date,
    });
  };
};

export const paymentFailure = async (req, res) => {
  const { txnid } = req.body;
  const key = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_SALT;
  const date = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  try {
    // ✅ Generate hash for verification
    const hashString = `${key}|verify_payment|${txnid}|${salt}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    // ✅ Prepare payload for PayU verification
    const payload = new URLSearchParams({
      key,
      command: "verify_payment",
      hash,
      var1: txnid,
    });

    // ✅ Request to PayU for verification
    const response = await axios.post(
      "https://info.payu.in/merchant/postservice?form=2",
      payload.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const payUResponse = response.data;

    // ✅ Validate transaction details
    if (!payUResponse.transaction_details || !payUResponse.transaction_details[txnid]) {
      return res.status(400).render("paymentFailure", {
        txnid,
        status: "Transaction details missing",
        reason: "No valid transaction details received from PayU.",
        date,
      });
    };

    const transactionDetails = payUResponse.transaction_details[txnid];
    const status = transactionDetails.status;

    // ✅ Handle failure statuses
    if (payUResponse.status === 1) {
      if (["failed", "cancelled", "bounced", "dropped"].includes(status)) {
        await Payment.findOneAndUpdate(
          { transactionId: txnid },
          {
            paymentStatus: "Failed",
            failureReason: transactionDetails.error_Message || "Unknown reason",
            paymentDate: date,
            payUResponse,
          },
          { new: true },
        );

        return res.status(400).render("paymentFailure", {
          txnid,
          status,
          reason: transactionDetails.error_Message || "No reason provided by PayU.",
          date,
        });
      } else {
        // ✅ Handle unexpected payment statuses
        return res.status(400).render("paymentFailure", {
          txnid,
          status,
          reason: `Unexpected status received: ${status}`,
          date,
        });
      };
    } else {
      // ✅ Handle PayU verification failure
      return res.status(400).render("paymentFailure", {
        txnid,
        status: "Verification Failed",
        reason: "Payment verification failed from PayU side.",
        date,
      });
    };
  } catch (error) {
    // ✅ Handle internal server errors with proper logging
    return res.status(500).render("paymentFailure", {
      txnid,
      status: "Internal Server Error",
      reason: error.response?.data?.message || error.message || "Something went wrong during verification.",
      date,
    });
  };
};

export const redirectTo = async (req, res) => {
  const {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    phone,
    surl,
    furl,
    hash,
  } = req.query;

  if (!key || !txnid || !amount || !productinfo || !firstname || !email || !phone || !surl || !furl || !hash) {
    return res.status(400).send("Missing required payment parameters.");
  };

  const formHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redirecting to PayU...</title>
    </head>
    <body>
      <h2>Redirecting to PayU, please wait...</h2>
      <form id="paymentForm" action="https://secure.payu.in/_payment" method="post">
        <input type="hidden" name="key" value="${key}" />
        <input type="hidden" name="txnid" value="${txnid}" />
        <input type="hidden" name="amount" value="${amount}" />
        <input type="hidden" name="productinfo" value="${productinfo}" />
        <input type="hidden" name="firstname" value="${firstname}" />
        <input type="hidden" name="email" value="${email}" />
        <input type="hidden" name="phone" value="${phone}" />
        <input type="hidden" name="surl" value="${surl}" />
        <input type="hidden" name="furl" value="${furl}" />
        <input type="hidden" name="hash" value="${hash}" />
        <input type="submit" value="Pay Now" />
      </form>
      <script>
        window.onload = function () {
          document.getElementById("paymentForm").submit();
        };
      </script>
    </body>
    </html>
  `;

  res.send(formHTML);
};

// Get all payments with search, sort, filter, and pagination
export const getAllPayments = async (req, res) => {
  try {
    let filter = {};
    let sort = {};

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter = {
        $or: [
          { proformaInvoiceId: searchRegex },
          { clientName: searchRegex },
          { companyName: searchRegex },
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

      filter.paymentDate = {
        $gte: startDate,
        $lt: endDate
      };
    };

    // Handle month-wise filtering (ignore year)
    if (req.query.month && !req.query.year) {
      const month = parseInt(req.query.month);

      filter.paymentDate = {
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

      filter.paymentDate = {
        $gte: startDate,
        $lt: endDate
      };
    };

    sort = req.query.sort === 'Ascending' ? { createdAt: 1 } : { createdAt: -1 };

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const payment = await Payment
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("office")
      .exec();

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    };

    const totalCount = await Payment.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "All payment fetched successfully",
      payment: payment,
      totalCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  };
};

// Get a single payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the payment from the database using the ID
    const payment = await Payment
      .findById(id)
      .populate("office")
      .exec();

    // If payment not found
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    };

    // Return the payment details
    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message, });
  };
};

// Update a payment by ID
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if the payment exists before updating
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    };

    // Update the payment with new data
    const updatedPayment = await Payment.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated payment document
      runValidators: true, // Run validation before saving
    });

    // Return the updated payment
    return res.status(200).json({ success: true, data: updatedPayment });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  };
};

// Delete a payment by ID
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the payment exists before deleting
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    };

    // Delete the payment
    await Payment.findByIdAndDelete(id);

    // Return success message
    return res.status(200).json({ success: true, message: "Payment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  };
};

