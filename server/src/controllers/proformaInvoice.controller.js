import Invoice from "../models/proformaInvoice.model.js";
import ProformaInvoiceId from "../models/proformaInvoiceId.model.js";

// Helper function to generate the next proforma invoice id
const getNextProformaInvoiceId = async () => {
  const counter = await ProformaInvoiceId.findOneAndUpdate(
    { _id: "proformaInvoiceId" },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );
  return `#CD${1818 + counter.sequence}`;
};

// Controller for creating an invoice
export const createInvoice = async (req, res) => {
  try {
    const { projects, date, tax, clientName, GSTNumber, shipTo, state } = req.body;

    let total = 0;
    let subtotal = 0;
    let CGST = 0;
    let SGST = 0;
    let IGST = 0;

    // Calculate subtotal by summing up the cost of all projects
    const invoiceProjects = projects.map((project) => {
      let projectCost = parseFloat(project.projectCost) * parseFloat(project.quantity);

      // Adjust for inclusive tax
      if (tax === "Inclusive") {
        projectCost = projectCost / 1.18;
      };

      subtotal += projectCost;

      return {
        projectName: project.projectName,
        projectCost: tax === "Inclusive" ? (project.projectCost / 1.18).toFixed(2) : project.projectCost,
        quantity: project.quantity,
      };
    });

    // Apply GST based on state
    if (state === "Delhi") {
      CGST = subtotal * 0.09;
      SGST = subtotal * 0.09;
      total = subtotal + CGST + SGST;
    } else {
      IGST = subtotal * 0.18;
      total = subtotal + IGST;
    };

    // Ensure the date is a valid Date object
    const invoiceDate = date ? new Date(date) : new Date();

    // Create new proforma invoice
    const newInvoice = new Invoice({
      date: invoiceDate,
      tax,
      projects: invoiceProjects,
      clientName,
      GSTNumber,
      shipTo,
      state,
      subtotal: subtotal.toFixed(2),
      CGST: CGST.toFixed(2),
      SGST: SGST.toFixed(2),
      IGST: IGST.toFixed(2),
      total: total.toFixed(2),
      balanceDue: total.toFixed(2)
    });

    await newInvoice.save();

    // Generate the next proformaInvoiceId only after successful save
    const proformaInvoiceId = await getNextProformaInvoiceId();

    // Update the proformainvoice document with the generated proformaInvoiceId
    newInvoice.proformaInvoiceId = proformaInvoiceId;

    await newInvoice.save();

    return res.status(200).json({ success: true, message: "Proforma invoice created successfully", invoice: newInvoice });
  } catch (error) {
    console.error("Error while creating proforma invoice:", error.message);
    return res.status(500).json({ success: false, message: `Error while creating proforma invoice: ${error.message}` });
  };
};

// Helper function to build the projection object based on user permissions
const buildProjection = (permissions) => {
  const invoiceFields = permissions.invoice.fields;
  const projection = {};

  for (const [key, value] of Object.entries(invoiceFields)) {
    if (value.show) {
      projection[key] = 1;
    } else {
      projection[key] = 0;
    };
  };

  // Ensure _id, createdAt and updatedAt are included by default unless explicitly excluded
  projection._id = 1;
  projection.createdAt = 1;
  projection.updatedAt = 1;

  return projection;
};

// Helper function to filter fields based on projection
const filterFields = (invoice, projection) => {
  const filteredInvoice = {};

  for (const key in invoice._doc) {
    if (projection[key] !== 0) {  // only exclude if explicitly set to 0
      filteredInvoice[key] = invoice[key];
    };
  };

  // Include _id, createdAt, and updatedAt if they were not excluded
  if (projection._id !== 0) {
    filteredInvoice._id = invoice._id;
  };

  if (projection.createdAt !== 0) {
    filteredInvoice.createdAt = invoice.createdAt;
  };

  if (projection.updatedAt !== 0) {
    filteredInvoice.updatedAt = invoice.updatedAt;
  };

  return filteredInvoice;
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
          { GSTNumber: searchRegex },
          { state: searchRegex },
          { shipTo: searchRegex },
          { billTo: searchRegex },
          { tax: searchRegex },
          { date: searchRegex },
          { 'projects.projectName': searchRegex }
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

      // Filtering for all records with the specified month (across all years)
      filter.date = {
        $expr: {
          $eq: [{ $month: "$date" }, month]
        },
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

    const proformaInvoices = await Invoice.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!proformaInvoices) {
      return res.status(404).json({ success: false, message: "Proforma invoices not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredProformaInvoices = proformaInvoices.map((invoice) => filterFields(invoice, projection));

    const totalCount = await Invoice.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "Proforma invoices fetched successfully",
      invoice: filteredProformaInvoices,
      totalCount,
    });

  } catch (error) {
    console.error("Error while fetching proforma invoice:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error while fetching proforma invoice",
      error: error.message,
    });
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

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredInvoice = filterFields(invoice, projection);

    return res.status(200).json({ success: true, message: "Single invoice fetched successfully", invoice: filteredInvoice });
  } catch (error) {
    console.log("Error while fetching single invoice:", error.message);
    return res.status(500).json({ success: false, message: "Error while fetching single invoice", error: error.message });
  };
};

// Controller for updating an invoice by ID
export const updateInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const { projects, date, tax, clientName, GSTNumber, shipTo, state } = req.body;

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Proforma invoice not found" });
    };

    let total = 0;
    let subtotal = 0;
    let CGST = 0;
    let SGST = 0;
    let IGST = 0;

    // Calculate subtotal by summing up the cost of all projects
    const updatedProjects = projects.map((project) => {
      let projectCost = parseFloat(project.projectCost) * parseFloat(project.quantity);

      // Adjust for inclusive tax
      if (tax === "Inclusive") {
        projectCost = projectCost / 1.18;
      };

      subtotal += projectCost;

      return {
        projectName: project.projectName,
        projectCost: tax === "Inclusive" ? (project.projectCost / 1.18).toFixed(2) : project.projectCost,
        quantity: project.quantity,
      };
    });

    // Apply GST based on state
    if (state === "Delhi") {
      CGST = subtotal * 0.09;
      SGST = subtotal * 0.09;
      total = subtotal + CGST + SGST;
    } else {
      IGST = subtotal * 0.18;
      total = subtotal + IGST;
    };

    // Ensure the date is a valid Date object
    const invoiceDate = date ? new Date(date) : new Date();

    // Update invoice fields
    invoice.date = invoiceDate;
    invoice.tax = tax;
    invoice.projects = updatedProjects;
    invoice.clientName = clientName;
    invoice.GSTNumber = GSTNumber;
    invoice.shipTo = shipTo;
    invoice.state = state;
    invoice.subtotal = subtotal.toFixed(2);
    invoice.CGST = CGST.toFixed(2);
    invoice.SGST = SGST.toFixed(2);
    invoice.IGST = IGST.toFixed(2);
    invoice.total = total.toFixed(2);
    invoice.balanceDue = total.toFixed(2);

    await invoice.save();

    return res.status(200).json({ success: true, message: "proforma invoice updated successfully", invoice });

  } catch (error) {
    console.error("Error while updating invoice proforma:", error.message);
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
    console.log("Error while deleting invoice:", error.message);
    return res.status(500).json({ success: false, message: "Error while deleting invoice", error: error.message });
  };
};
