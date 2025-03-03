import Invoice from "../models/invoice.model.js";
import Project from "../models/project.model.js";
import OfficeLocation from "../models/officeLocation.model.js";
import mongoose from "mongoose";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
import formatDate from "../utils/formatDate.js";

dotenv.config();

// Controller for creating an invoice
export const createInvoice = async (req, res) => {
  try {
    const { project, date, tax, amount, office } = req.body;

    const officeLocation = await OfficeLocation
      .findById(office);

    if (!officeLocation) {
      return res.status(404).json({ success: false, message: "Office not found" });
    };

    const projectDetails = await Project
      .findById(project)
      .populate("customer", "state")
      .exec();

    if (!projectDetails) {
      return res.status(404).json({ success: false, message: "Project not found" });
    };

    let subtotal = parseFloat(amount);
    let CGST = 0, SGST = 0, IGST = 0, total = 0;

    if (tax === "Inclusive") {
      subtotal = subtotal / 1.18;
    };

    if (customerState === "Delhi") {
      CGST = subtotal * 0.09;
      SGST = subtotal * 0.09;
      total = subtotal + CGST + SGST;
    } else {
      IGST = subtotal * 0.18;
      total = subtotal + IGST;
    };

    const projectName = projectDetails?.projectName;
    const customerState = projectDetails?.customer?.state;
    const clientName = projectDetails?.customer?.name;
    const companyName = projectDetails?.customer?.companyName;
    const GSTNumber = projectDetails?.customer?.GSTNumber;
    const shipTo = projectDetails?.customer?.address;
    const email = projectDetails?.customer?.email;
    const invoiceId = Date.now();

    const newInvoice = new Invoice({
      invoiceId,
      date,
      tax,
      project,
      office,
      amount: subtotal.toFixed(2),
      subtotal: subtotal.toFixed(2),
      CGST: CGST.toFixed(2),
      SGST: SGST.toFixed(2),
      IGST: IGST.toFixed(2),
      total: total.toFixed(2),
      balanceDue: total.toFixed(2)
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
          <img src="${officeLocation?.logo || logoSrc}" alt="logo">
        </div>
        <div class="invoice-title">
          <h4>TAX INVOICE</h4>
        </div>
      </div>
      <div class="invoice-details">
        <div class="billing-info">
          <div><strong>C${officeLocation?.name}</strong></div>
          <div>Address:</div>
          <div>${officeLocation?.addressLine1},</div>
          <div>${officeLocation?.addressLine2},</div>
          <div>${officeLocation?.addressLine3}.</div>
          <div><strong>GST No: ${officeLocation?.GSTNumber}</strong></div>
        </div>
        <div class="invoice-meta">
          <div class="invoice-id">Invoice ID: <strong>${invoiceId}</strong></div>
          <div class="invoice-date">
            <strong>Date:</strong>
            <span>${formatDate(date)}</span>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="billing-address">
          <div><strong>Bill To:</strong></div>
          <div>${companyName || clientName}</div>
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
        <div><strong>Account Name: </strong>${officeLocation?.accountName || "Code Diffusion Technologies"}</div>
        <div><strong>Account Type: </strong>${officeLocation?.accountType || "Current Account"}</div>
        <div><strong>Account Number: </strong>${officeLocation?.accountNumber || "60374584640"}</div>
        <div><strong>Bank Name: </strong>${officeLocation?.bankName || "Bank of Maharashtra"}</div>
        <div><strong>IFSC Code: </strong>${officeLocation?.IFSCCode || "mahb0001247"}</div>
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
      from: officeLocation?.noReplyEmail || process.env.SENDER_EMAIL_ID,
      to: email,
      subject: `Tax Invoice from ${officeLocation?.name || "Code Diffusion Technologies"} - ${formatDate(date)}`,
      text: `Dear ${clientName},

We hope you’re doing well.

Please find attached the tax invoice for the services/products provided by ${officeLocation?.name || "Code Diffusion Technologies"}. The invoice includes a detailed breakdown of charges, applicable taxes, and payment terms for your reference.

Kindly review the invoice and let us know if you have any questions or need further assistance. If everything is in order, we would appreciate it if you could process the payment by the due date mentioned in the invoice.

Thank you for choosing ${officeLocation?.name || "Code Diffusion Technologies"}. We look forward to continuing our collaboration.

Best regards,  
Abhishek Singh
${officeLocation?.name || "Code Diffusion Technologies"} 
${officeLocation?.contact || "+91-7827114607"}
${officeLocation?.email || "info@codediffusion.in"}
${officeLocation?.websiteLink || "https://www.codediffusion.in/"}`,
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
        user: officeLocation?.noReplyEmail || process.env.SENDER_EMAIL_ID,
        pass: officeLocation?.noReplyEmailAppPassword || process.env.SENDER_EMAIL_APP_PASSWORD,
      },
    });

    // Send the email
    await transporter.sendMail(mailOptions);

    // Save the invoice record
    await newInvoice.save();

    // Cleanup the generated PDF
    fs.unlinkSync(pdfPath);

    return res.status(201).json({ success: true, invoice: newInvoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Helper function to find ObjectId by string in referenced models
const findObjectIdByString = async (modelName, fieldName, searchString) => {
  const Model = mongoose.model(modelName);
  const result = await Model.findOne({ [fieldName]: { $regex: new RegExp(searchString, 'i') } }).select('_id');
  return result ? result._id : null;
};

// Helper function to fetch projects where the customer field matches the given teamId
const getProjectsByCustomer = async (teamId) => {
  try {
    const projects = await Project.find({ customer: teamId }).select("_id");
    return projects.map((project) => project._id);
  } catch (error) {
    throw new Error("Error while fetching projects by customer");
  };
};

// Controller for fetching all invoice
export const fetchAllInvoice = async (req, res) => {
  try {
    let filter = {};
    let sort = {};

    const userRole = req.team.role.name.toLowerCase();

    if (userRole === "client" && req.teamId) {
      filter.project = { $in: await getProjectsByCustomer(req.teamId) };
    };

    // Handle searching across all fields
    if (req.query.search) {
      filter.$or = [
        { project: await findObjectIdByString('Project', 'projectName', req.query.search) },
      ];
    };

    // Handle invoice id search
    if (req.query.nameSearch) {
      filter.invoiceId = { $regex: new RegExp(req.query.nameSearch, 'i') };
    };

    // Handle invoice id filter
    if (req.query.nameFilter) {
      filter.invoiceId = { $in: Array.isArray(req.query.nameFilter) ? req.query.nameFilter : [req.query.nameFilter] };
    };

    // Handle year-wise filtering
    if (req.query.year && !req.query.month) {
      const year = req.query.year;

      filter.date = {
        $gte: `${year}-01-01`,
        $lte: `${year}-12-31`,
      };
    };

    // Handle month-wise filtering
    if (req.query.month && !req.query.year) {
      const month = req.query.month.padStart(2, "0");
      const currentYear = new Date().getFullYear();

      filter.date = {
        $gte: `${currentYear}-${month}-01`,
        $lte: `${currentYear}-${month}-31`,
      };
    };

    // Handle both year and month filtering
    if (req.query.year && req.query.month) {
      const year = req.query.year;
      const month = req.query.month.padStart(2, "0");

      filter.date = {
        $gte: `${year}-${month}-01`,
        $lte: `${year}-${month}-31`,
      };
    };

    // Handle sorting
    if (req.query.sort === 'Ascending') {
      sort = { createdAt: 1 };
    } else {
      sort = { createdAt: -1 };
    };

    // Handle pagination
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const invoice = await Invoice
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("office")
      .populate({
        path: "project",
        select: "",
        populate: {
          path: "customer",
          select: "",
        },
      })
      .exec();

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    };

    const totalCount = await Invoice.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All invoice fetched successfully", invoice, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error while fetching all invoice", error: error.message });
  };
};

// Controller for fetching a single invoice
export const fetchSingleInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await Invoice
      .findById(invoiceId)
      .populate("office")
      .populate({
        path: "project",
        select: "",
        populate: {
          path: "customer",
          select: "",
        },
      })
      .exec();

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    };

    return res.status(200).json({ success: true, message: "Single invoice fetched successfully", invoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error while fetching single invoice", error: error.message });
  };
};

// Fetch invoice by project
export const fetchInvoiceByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const invoices = await Invoice
      .find({ project: projectId })
      .populate("office")
      .populate({
        path: "project",
        select: "",
        populate: {
          path: "customer",
          select: "",
        },
      })
      .exec();

    if (!invoices) {
      return res.status(404).json({ success: false, message: "Invoices not found" });
    };

    const totalReceived = invoices.reduce((sum, invoice) => {
      const received = invoice.tax === "Inclusive"
        ? parseFloat(invoice.total) || 0
        : parseFloat(invoice.subtotal) || 0;
      return sum + received;
    }, 0);

    return res.status(200).json({ success: true, invoices, totalReceived });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  };
};

// Controller for update an invoice by ID
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { project, date, tax, amount, office } = req.body;

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    };

    let subtotal = parseFloat(amount);
    let CGST = 0, SGST = 0, IGST = 0, total = 0;

    if (tax === "Inclusive") {
      subtotal = subtotal / 1.18;
    };

    const projectDetails = await Project.findById(project).populate("customer", "state");
    const customerState = projectDetails.customer.state;

    if (customerState === "Delhi") {
      CGST = subtotal * 0.09;
      SGST = subtotal * 0.09;
      total = subtotal + CGST + SGST;
    } else {
      IGST = subtotal * 0.18;
      total = subtotal + IGST;
    };

    invoice.project = project;
    invoice.tax = tax;
    invoice.date = date;
    invoice.office = office;
    invoice.amount = subtotal.toFixed(2);
    invoice.subtotal = subtotal.toFixed(2);
    invoice.CGST = CGST.toFixed(2);
    invoice.SGST = SGST.toFixed(2);
    invoice.IGST = IGST.toFixed(2);
    invoice.total = total.toFixed(2);
    invoice.balanceDue = total.toFixed(2);

    await invoice.save();

    return res.status(200).json({ success: true, invoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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
