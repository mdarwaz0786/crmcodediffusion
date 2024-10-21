import PurchaseInvoice from "../models/purchaseInvoice.model.js";

// Controller for creating a purchase invoice
export const createPurchaseInvoice = async (req, res) => {
  try {
    const { name, amount } = req.body;

    const purchaseInvoice = new PurchaseInvoice({ name, amount });
    await purchaseInvoice.save();

    return res.status(200).json({ success: true, message: "Purchase invoice created successfully", purchaseInvoice });
  } catch (error) {
    console.log("Error while creating purchase invoice:", error.message);
    return res.status(500).json({ success: false, message: `Error while creating purchase invoice: ${error.message}` });
  };
};

// Helper function to build the projection object based on user permissions
const buildProjection = (permissions) => {
  const purchaseInvoiceFields = permissions.purchaseInvoice.fields;
  const projection = {};

  for (const [key, value] of Object.entries(purchaseInvoiceFields)) {
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
const filterFields = (purchaseInvoice, projection) => {
  const filteredPurchaseInvoice = {};

  for (const key in purchaseInvoice._doc) {
    if (projection[key] !== 0) {  // only exclude if explicitly set to 0
      filteredPurchaseInvoice[key] = purchaseInvoice[key];
    };
  };

  // Include _id, createdAt, and updatedAt if they were not excluded
  if (projection._id !== 0) {
    filteredPurchaseInvoice._id = purchaseInvoice._id;
  };

  if (projection.createdAt !== 0) {
    filteredPurchaseInvoice.createdAt = purchaseInvoice.createdAt;
  };

  if (projection.updatedAt !== 0) {
    filteredPurchaseInvoice.updatedAt = purchaseInvoice.updatedAt;
  };

  return filteredPurchaseInvoice;
};

// Controller for fetching all purchase invoice
export const fetchAllPurchaseInvoice = async (req, res) => {
  try {
    let filter = {};
    let sort = {};

    // Handle universal searching across all fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: { $regex: searchRegex } },
        { amount: { $regex: searchRegex } },
      ];
    };

    // Handle name search
    if (req.query.name) {
      filter.name = { $regex: new RegExp(req.query.name, 'i') };
    };

    // Handle name filter
    if (req.query.nameFilter) {
      filter.name = { $in: Array.isArray(req.query.nameFilter) ? req.query.nameFilter : [req.query.nameFilter] };
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

    const purchaseInvoice = await PurchaseInvoice.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!purchaseInvoice) {
      return res.status(404).json({ success: false, message: "Purchase invoice not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredPurchaseInvoice = purchaseInvoice.map((purchaseInvoice) => filterFields(purchaseInvoice, projection));
    const totalCount = await PurchaseInvoice.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All purchase invoice fetched successfully", purchaseInvoice: filteredPurchaseInvoice, totalCount });
  } catch (error) {
    console.log("Error while fetching all purchase invoice:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching all purchase invoice: ${error.message}` });
  };
};

// Controller for fetching a single purchase invoice
export const fetchSinglePurchaseInvoice = async (req, res) => {
  try {
    const purchaseInvoiceId = req.params.id;
    const purchaseInvoice = await PurchaseInvoice.findById(purchaseInvoiceId);

    if (!purchaseInvoice) {
      return res.status(404).json({ success: false, message: "Purchase invoice not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredPurchaseInvoice = filterFields(purchaseInvoice, projection);

    return res.status(200).json({ success: true, message: "Single purchase invoice fetched successfully", purchaseInvoice: filteredPurchaseInvoice });
  } catch (error) {
    console.log("Error while fetching single purchase invoice:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching single purchase invoice: ${error.message}` });
  };
};

// Controller for updating a purchase invoice
export const updatePurchaseInvoice = async (req, res) => {
  try {
    const purchaseInvoiceId = req.params.id;
    const { name, amount } = req.body;

    const purchaseInvoice = await PurchaseInvoice.findByIdAndUpdate(purchaseInvoiceId, { name, amount }, { new: true });

    if (!purchaseInvoice) {
      return res.status(404).json({ success: false, message: "Purchase invoice not found" });
    };

    return res.status(200).json({ success: true, message: "Purchase invoice updated successfully", purchaseInvoice });
  } catch (error) {
    console.log("Error while updating purchase invoice:", error.message);
    return res.status(500).json({ success: false, message: `Error while updating purchase invoice: ${error.message}` });
  };
};

// Controller for deleting a purchase invoice
export const deletePurchaseInvoice = async (req, res) => {
  try {
    const purchaseInvoiceId = req.params.id;
    const purchaseInvoice = await PurchaseInvoice.findByIdAndDelete(purchaseInvoiceId);

    if (!purchaseInvoice) {
      return res.status(400).json({ success: false, message: "Purchase invoice not found" });
    };

    return res.status(200).json({ success: true, message: "Purchase invoice deleted successfully" });
  } catch (error) {
    console.log("Error while deleting purchase invoice:", error.message);
    return res.status(500).json({ success: false, message: `Error while deleting purchase invoice: ${error.message}` });
  };
};
