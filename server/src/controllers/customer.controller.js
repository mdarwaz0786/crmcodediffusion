import Customer from "../models/customer.model.js";
import generateClientToken from "../utils/generateClientToken.js";

// Controller for creating a customer
export const createCustomer = async (req, res) => {
  try {
    const { name, email, password, mobile, GSTNumber, companyName, state, address, role } = req.body;
    const company = req.company;

    const customer = new Customer({ name, email, password, mobile, GSTNumber, companyName, state, address, role, company });
    await customer.save();

    return res.status(200).json({ success: true, message: "Customer created successfully", customer });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while creating customer: ${error.message}` })
  };
};

// controller for login customer
export const loginCustomer = async (req, res) => {
  try {
    const { mobile, password, fcmToken, deviceId } = req.body;

    const customer = await Customer.findOne({ mobile });

    if (!customer) {
      return res.status(404).json({ success: false, message: "Invalid mobile number" });
    };

    if (password !== customer.password) {
      return res.status(401).json({ success: false, message: "Invalid Password" });
    };

    if (!!fcmToken) {
      customer.fcmToken = fcmToken;
      await customer.save();
    };

    if (!!deviceId) {
      customer.deviceId = deviceId;
      await customer.save();
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateClientToken(
        customer?._id,
        customer?.name,
        customer?.email,
        customer?.password,
        customer?.mobile,
        customer?.GSTNumber,
        customer?.companyName,
        customer?.state,
        customer?.address,
        customer?.role?._id,
        customer?.fcmToken,
        customer?.deviceId,
        customer?.allowMultiDevice,
        "Client",
      ),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while login client: ${error.message}` });
  };
};

// Controller for fetching logged in customer
export const loggedInCustomer = async (req, res) => {
  try {
    const customer = await Customer
      .findById(req.team?._id)
      .populate({ path: "role", select: "" })
      .populate({ path: "company", select: "-password" })
      .exec();

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Clinet not found' });
    };

    return res.status(200).json({ success: true, message: 'Logged in client fetched successfully', team: customer });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching logged in client: ${error.message}` });
  };
};

// Controller for fetching all customer
export const fetchAllCustomer = async (req, res) => {
  try {
    let filter = { company: req.company };
    let sort = {};

    const userRole = req.team?.role?.name?.toLowerCase();

    if (userRole === "client") {
      filter._id = req.teamId;
    };

    // Handle searching across all fields
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

    const customer = await Customer
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("role")
      .populate({ path: "company", select: "-password" })
      .exec();

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    };

    const totalCount = await Customer.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All customer fetched successfully", customer, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching all customer: ${error.message}` });
  };
};

// Controller for fetching a single customer
export const fetchSingleCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const company = req.company;

    const customer = await Customer
      .findOne({ _id: customerId, company })
      .populate("role")
      .populate({ path: "company", select: "-password" })
      .exec();

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    };

    return res.status(200).json({ success: true, message: "Single customer fetched successfully", customer });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while fetching single customer: ${error.message}` });
  };
};

// Controller for updating a customer
export const updateCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const company = req.company;

    const { name, email, password, mobile, GSTNumber, companyName, state, address, role } = req.body;

    const updatedCustomer = await Customer
      .findByIdAndUpdate({ _id: customerId, company }, { name, email, password, mobile, GSTNumber, companyName, state, address, role }, { new: true, runValidators: true });

    if (!updatedCustomer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    };

    return res.status(200).json({ success: true, message: "Customer updated successfully", updatedCustomer });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while updating customer: ${error.message}` })
  };
};

// Controller for deleting a customer
export const deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const company = req.company;

    const deletedCustomer = await Customer
      .findOneAndDelete({ _id: customerId, company });

    if (!deletedCustomer) {
      return res.status(400).json({ success: false, message: "Customer not found" });
    };

    return res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error while deleting customer: ${error.message}` });
  };
};
