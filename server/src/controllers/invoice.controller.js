import Invoice from "../models/invoice.model.js";
import Project from "../models/project.model.js";
import InvoiceId from "../models/invoiceId.model.js";
import mongoose from "mongoose";

// Helper function to generate the next invoiceId
const getNextInvoiceId = async () => {
  const counter = await InvoiceId.findOneAndUpdate({ _id: "invoiceId" }, { $inc: { sequence: 1 } }, { new: true, upsert: true });
  return `#CD${1818 + counter.sequence}`;
};

// Controller for creating an invoice
export const createInvoice = async (req, res) => {
  try {
    const { projects, date, tax } = req.body;

    let total = 0;
    let subtotal = 0;
    let CGST = 0;
    let SGST = 0;
    let IGST = 0;

    // Calculate subtotal by summing up the amount of all projects
    const invoiceProjects = await Promise.all(
      projects.map(async (projectData) => {
        const { project, amount } = projectData;

        let originalAmount = parseFloat(amount);

        // Adjust amount for inclusive tax
        if (tax === "Inclusive") {
          originalAmount = parseFloat(amount) / 1.18;
        };

        subtotal += originalAmount;

        return {
          project,
          amount: originalAmount.toFixed(2),
        };
      })
    );

    // Determine whether to apply CGST/SGST or IGST based on customer's state
    const firstProjectDetails = await Project.findById(projects[0].project).populate({ path: "customer", select: "state" });
    const customerState = firstProjectDetails.customer.state;

    if (customerState === "Delhi") {
      CGST = subtotal * 0.09;
      SGST = subtotal * 0.09;
      total = subtotal + CGST + SGST;
    } else {
      IGST = subtotal * 0.18;
      total = subtotal + IGST;
    };

    const newInvoice = new Invoice({
      projects: invoiceProjects,
      tax,
      date,
      subtotal: subtotal.toFixed(2),
      CGST: CGST.toFixed(2),
      SGST: SGST.toFixed(2),
      IGST: IGST.toFixed(2),
      total: total.toFixed(2),
      balanceDue: total.toFixed(2),
    });

    await newInvoice.save();

    // Generate the next invoiceId only after successful save
    const invoiceId = await getNextInvoiceId();

    // Update the invoice document with the generated invoiceId
    newInvoice.invoiceId = invoiceId;
    await newInvoice.save();

    return res.status(200).json({ success: true, message: "Invoice created successfully", invoice: newInvoice });
  } catch (error) {
    console.log("Error while creating invoice:", error.message);
    return res.status(500).json({ success: false, message: `Error while creating invoice: ${error.message}` });
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

// Controller for fetching all invoice
export const fetchAllInvoice = async (req, res) => {
  try {
    let filter = {};
    let sort = {};

    // Handle universal searching across all fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      const customers = await mongoose.model('Customer').find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { mobile: searchRegex },
          { GSTNumber: searchRegex },
          { companyName: searchRegex },
          { state: searchRegex },
          { address: searchRegex },
        ]
      }).select('_id');

      // Find projects associated with these customers
      const projectIds = await mongoose.model('Project').find({
        $or: [
          { projectName: searchRegex },
          { projectId: searchRegex },
          { customer: { $in: customers.map((customer) => customer._id) } },
        ]
      }).select('_id');

      filter = {
        $or: [
          { invoiceId: searchRegex },
          { tax: searchRegex },
          { date: searchRegex },
          { 'projects.project': { $in: projectIds.map((project) => project._id) } },
        ],
      };
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
      const currentYear = new Date().getFullYear();  // Default to current year if only month is provided

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

    const invoice = await Invoice.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: "projects.project",
        select: "customer projectName projectId projectPrice totalPaid totalDues",
        populate: [
          {
            path: "customer",
            select: "",
          },
        ],
      }).exec();

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredInvoice = invoice.map((invoice) => filterFields(invoice, projection));
    const totalCount = await Invoice.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All invoice fetched successfully", invoice: filteredInvoice, totalCount });
  } catch (error) {
    console.log("Error while fetching all invoice:", error.message);
    return res.status(500).json({ success: false, message: "Error while fetching all invoice", error: error.message });
  };
};

// Controller for fetching a single invoice
export const fetchSingleInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId)
      .populate({
        path: "projects.project",
        select: "customer projectName projectId projectPrice totalPaid totalDues",
        populate: [
          {
            path: "customer",
            select: "",
          },
        ],
      }).exec();

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

// Controller for update an invoice by ID
export const updateInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const { projects, date, tax } = req.body;

    const invoice = await Invoice.findById(invoiceId).populate("projects.project");

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    };

    let total = 0;
    let subtotal = 0;
    let CGST = 0;
    let SGST = 0;
    let IGST = 0;

    // Calculate subtotal by summing up the amount of all projects
    const invoiceProjects = await Promise.all(
      projects.map(async (projectData) => {
        const { project, amount } = projectData;

        let originalAmount = parseFloat(amount);

        // Adjust amount for inclusive tax
        if (tax === "Inclusive") {
          originalAmount = parseFloat(amount) / 1.18;
        };

        subtotal += originalAmount;

        return {
          project,
          amount: originalAmount.toFixed(2),
        };
      })
    );

    // Determine whether to apply CGST/SGST or IGST based on customer's state
    const firstProjectDetails = await Project.findById(projects[0].project).populate("customer");
    const customerState = firstProjectDetails.customer.state;

    if (customerState === "Delhi") {
      CGST = subtotal * 0.09;
      SGST = subtotal * 0.09;
      total = subtotal + CGST + SGST;
    } else {
      IGST = subtotal * 0.18;
      total = subtotal + IGST;
    };

    // Update invoice details
    invoice.projects = invoiceProjects;
    invoice.tax = tax;
    invoice.date = date;
    invoice.subtotal = subtotal.toFixed(2);
    invoice.CGST = CGST.toFixed(2);
    invoice.SGST = SGST.toFixed(2);
    invoice.IGST = IGST.toFixed(2);
    invoice.total = total.toFixed(2);
    invoice.balanceDue = total.toFixed(2);

    await invoice.save();

    return res.status(200).json({ success: true, message: "Invoice updated successfully", invoice });
  } catch (error) {
    console.log("Error while updating invoice:", error.message);
    return res.status(500).json({ success: false, message: "Error while updating invoice", error: error.message });
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
