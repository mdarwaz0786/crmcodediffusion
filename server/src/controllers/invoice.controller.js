import Invoice from "../models/invoice.model.js";
import Project from "../models/project.model.js";
import InvoiceId from "../models/invoiceId.model.js";
import mongoose from "mongoose";

// Helper function to generate the next invoiceId
const getNextInvoiceId = async () => {
  const counter = await InvoiceId.findOneAndUpdate(
    { _id: "invoiceId" },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true },
  );
  return `#CD${1818 + counter.sequence}`;
};

// Controller for creating an invoice
export const createInvoice = async (req, res) => {
  try {
    const { project, date, tax, amount } = req.body;

    let subtotal = parseFloat(amount);
    let CGST = 0, SGST = 0, IGST = 0, total = 0;

    if (tax === "Inclusive") {
      subtotal = subtotal / 1.18;
    };

    const projectDetails = await Project.findById(project).populate("customer", "state");

    if (!projectDetails) {
      return res.status(404).json({ success: false, message: "Project not found" });
    };

    const customerState = projectDetails.customer.state;

    if (customerState === "Delhi") {
      CGST = subtotal * 0.09;
      SGST = subtotal * 0.09;
      total = subtotal + CGST + SGST;
    } else {
      IGST = subtotal * 0.18;
      total = subtotal + IGST;
    };

    const newInvoice = new Invoice({
      project,
      tax,
      date,
      amount: subtotal.toFixed(2),
      subtotal: subtotal.toFixed(2),
      CGST: CGST.toFixed(2),
      SGST: SGST.toFixed(2),
      IGST: IGST.toFixed(2),
      total: total.toFixed(2),
      balanceDue: total.toFixed(2)
    });

    const invoiceId = await getNextInvoiceId();
    newInvoice.invoiceId = invoiceId;
    await newInvoice.save();

    res.status(201).json({ success: true, invoice: newInvoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    const invoice = await Invoice.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
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
    const invoice = await Invoice.findById(invoiceId)
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

    const invoices = await Invoice.find({ project: projectId })
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
    const { project, date, tax, amount } = req.body;

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
