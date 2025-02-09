import Customer from "../models/customer.model.js";

// Controller for creating a customer
export const createCustomer = async (req, res) => {
  try {
    const { name, email, mobile, GSTNumber, companyName, state, address } = req.body;

    const customer = new Customer({ name, email, mobile, GSTNumber, companyName, state, address });
    await customer.save();

    return res.status(200).json({ success: true, message: "Customer created successfully", customer });
  } catch (error) {
    console.log("Error while creating customer:", error.message);
    return res.status(500).json({ success: false, message: `Error while creating customer: ${error.message}` })
  };
};

// Helper function to build the projection object based on user permissions
const buildProjection = (permissions) => {
  const customerFields = permissions.customer.fields;
  const projection = {};

  for (const [key, value] of Object.entries(customerFields)) {
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
const filterFields = (customer, projection) => {
  const filteredCustomer = {};

  for (const key in customer._doc) {
    if (projection[key] !== 0) {  // only exclude if explicitly set to 0
      filteredCustomer[key] = customer[key];
    };
  };

  // Include _id, createdAt, and updatedAt if they were not excluded
  if (projection._id !== 0) {
    filteredCustomer._id = customer._id;
  };

  if (projection.createdAt !== 0) {
    filteredCustomer.createdAt = customer.createdAt;
  };

  if (projection.updatedAt !== 0) {
    filteredCustomer.updatedAt = customer.updatedAt;
  };

  return filteredCustomer;
};

// Controller for fetching all customer
export const fetchAllCustomer = async (req, res) => {
  try {
    let filter = {};
    let sort = {};

    // Handle universal searching across all fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { mobile: { $regex: searchRegex } },
        { GSTNumber: { $regex: searchRegex } },
        { state: { $regex: searchRegex } },
        { address: { $regex: searchRegex } },
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
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const customer = await Customer.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredCustomer = customer.map((customer) => filterFields(customer, projection));
    const totalCount = await Customer.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All customer fetched successfully", customer: filteredCustomer, totalCount });
  } catch (error) {
    console.log("Error while fetching all customer:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching all customer: ${error.message}` });
  };
};

// Controller for fetching a single customer
export const fetchSingleCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredCustomer = filterFields(customer, projection);

    return res.status(200).json({ success: true, message: "Single customer fetched successfully", customer: filteredCustomer });
  } catch (error) {
    console.log("Error while fetching single customer:", error.message);
    return res.status(500).json({ success: false, message: `Error while fetching single customer: ${error.message}` });
  };
};

// Controller for updating a customer
export const updateCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { name, email, mobile, GSTNumber, companyName, state, address } = req.body;

    const updatedCustomer = await Customer.findByIdAndUpdate(customerId, { name, email, mobile, GSTNumber, companyName, state, address }, { new: true });

    if (!updatedCustomer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    };

    return res.status(200).json({ success: true, message: "Customer updated successfully", updatedCustomer });
  } catch (error) {
    console.log("Error while updating customer:", error.message);
    return res.status(500).json({ success: false, message: `Error while updating customer: ${error.message}` })
  };
};

// Controller for deleting a customer
export const deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const deletedCustomer = await Customer.findByIdAndDelete(customerId);

    if (!deletedCustomer) {
      return res.status(400).json({ success: false, message: "Customer not found" });
    };

    return res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.log("Error while deleting customer:", error.message);
    return res.status(500).json({ success: false, message: `Error while deleting customer: ${error.message}` });
  };
};
