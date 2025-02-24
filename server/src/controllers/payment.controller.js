import Payment from "../models/payment.model.js";
import { generatePayUForm } from "../utils/generatePayUForm.js";

export const paymentSuccess = async (req, res) => {
  const { txnid } = req.body;

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: txnid },
      {
        paymentStatus: "Success",
        paymentDate: new Date(),
        payUResponse: req.body,
      },
      { new: true },
    );

    if (!updatedPayment) {
      return res.status(404).json({ success: false, message: "Payment record not found." });
    };

    return res.status(200).json({ success: true, message: "Payment Successful. Thank you!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again later." });
  };
};

export const paymentFailure = async (req, res) => {
  const { txnid } = req.body;

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: txnid },
      { paymentStatus: "Failed", payUResponse: req.body },
      { new: true },
    );

    if (!updatedPayment) {
      return res.status(404).json({ success: false, message: "Payment record not found." });
    };

    return res.status(400).json({ success: false, message: "Payment Failed. Please try again." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again later." });
  };
};

export const redirectTo = async (req, res) => {
  try {
    const { txnId } = req.params;

    const payment = await Payment
      .findOne({ transactionId: txnId });

    if (!payment) {
      return res.status(404).send("Invalid Payment Link.");
    };

    const formHtml = generatePayUForm({
      amount: payment.amount,
      productInfo: payment.projectName,
      firstName: payment.clientName,
      email: payment.email,
      phone: payment.phone,
      txnId: payment.transactionId,
    });

    return res.send(formHtml);
  } catch (error) {
    return res.status(500).send("Server Error");
  };
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
    const payment = await Payment.findById(id);

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

