import Invoice from "../models/invoice.model.js";
import Project from "../models/project.model.js";
import InvoiceId from "../models/invoiceId.model.js";
import mongoose from "mongoose";

// Helper function to generate the next invoiceId
const getNextInvoiceId = async () => {
  const counter = await InvoiceId.findOneAndUpdate({ _id: "invoiceId" }, { $inc: { sequence: 1 } }, { new: true, upsert: true });
  return `#IN${counter.sequence.toString().padStart(3, "0")}`;
};

// Controller for creating an invoice
export const createInvoice = async (req, res) => {
  try {
    const invoiceId = await getNextInvoiceId();
    const { project, amount, tax, date } = req.body;

    const projectData = await Project.findById(project).populate('customer');
    const customerState = projectData.customer.state;

    let calculatedCGST = 0;
    let calculatedSGST = 0;
    let calculatedIGST = 0;
    let basePrice = parseFloat(amount);
    let totalAmount = 0;

    if (tax === "Inclusive") {
      basePrice = parseFloat(amount) / 1.18;
      if (customerState === "Delhi") {
        calculatedCGST = basePrice * 0.09;
        calculatedSGST = basePrice * 0.09;
        totalAmount = basePrice;
      } else {
        calculatedIGST = basePrice * 0.18;
        totalAmount = basePrice;
      };
    } else {
      if (customerState === "Delhi") {
        calculatedCGST = basePrice * 0.09;
        calculatedSGST = basePrice * 0.09;
        totalAmount = basePrice + calculatedCGST + calculatedSGST;
      } else {
        calculatedIGST = basePrice * 0.18;
        totalAmount = basePrice + calculatedIGST;
      };
    };

    const newInvoice = new Invoice({
      invoiceId,
      project,
      quantity: 1,
      amount: parseFloat(amount),
      tax,
      CGST: parseFloat(calculatedCGST.toFixed(2)),
      SGST: parseFloat(calculatedSGST.toFixed(2)),
      IGST: parseFloat(calculatedIGST.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      balanceDue: parseFloat(totalAmount.toFixed(2)),
      date,
    });

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
          { project: { $in: projectIds.map((project) => project._id) } },
        ],
      };
    };

    // Handle name search
    if (req.query.nameSearch) {
      const searchRegex = new RegExp(req.query.nameSearch, 'i');
      const projectIds = await mongoose.model('Project').find({
        projectName: searchRegex,
      }).select('_id');
      filter.project = { $in: projectIds.map((project) => project._id) };
    };

    // Handle name filter
    if (req.query.nameFilter) {
      const nameFilterArray = Array.isArray(req.query.nameFilter) ? req.query.nameFilter : [req.query.nameFilter];
      const projectIds = await mongoose.model('Project').find({
        projectName: { $in: nameFilterArray }
      }).select('_id');
      filter.project = { $in: projectIds.map((project) => project._id) };
    };

    // Handle sorting
    if (req.query.sort === 'Ascending') {
      sort = { createdAt: 1 };
    } else {
      sort = { createdAt: -1 };
    };

    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const invoice = await Invoice.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'project',
        select: "customer projectName projectId",
        populate: [
          {
            path: 'customer',
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
        path: 'project',
        select: "customer projectName projectId",
        populate: [
          {
            path: 'customer',
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

// Controller for updating an invoice by ID
export const updateInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const { project, amount, tax, date } = req.body;

    const invoice = await Invoice.findById(invoiceId).populate('project');

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    };

    const projectData = await Project.findById(project).populate('customer');

    if (!projectData) {
      return res.status(404).json({ success: false, message: "Project not found" });
    };

    const customerState = projectData.customer.state;

    let calculatedCGST = 0;
    let calculatedSGST = 0;
    let calculatedIGST = 0;
    let basePrice = parseFloat(amount);
    let totalAmount = 0;

    if (tax === "Inclusive") {
      basePrice = parseFloat(amount) / 1.18;
      if (customerState === "Delhi") {
        calculatedCGST = basePrice * 0.09;
        calculatedSGST = basePrice * 0.09;
        totalAmount = basePrice;
      } else {
        calculatedIGST = basePrice * 0.18;
        totalAmount = basePrice;
      };
    } else {
      if (customerState === "Delhi") {
        calculatedCGST = basePrice * 0.09;
        calculatedSGST = basePrice * 0.09;
        totalAmount = basePrice + calculatedCGST + calculatedSGST;
      } else {
        calculatedIGST = basePrice * 0.18;
        totalAmount = basePrice + calculatedIGST;
      };
    };

    invoice.project = project;
    invoice.amount = parseFloat(amount);
    invoice.tax = tax;
    invoice.CGST = parseFloat(calculatedCGST.toFixed(2));
    invoice.SGST = parseFloat(calculatedSGST.toFixed(2));
    invoice.IGST = parseFloat(calculatedIGST.toFixed(2));
    invoice.totalAmount = parseFloat(totalAmount.toFixed(2));
    invoice.balanceDue = parseFloat(totalAmount.toFixed(2));
    invoice.date = date;

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
