import Payment from "../models/payment.model.js";
import axios from "axios";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

export const paymentSuccess = async (req, res) => {
  const { txnid } = req.body;
  const key = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_SALT;

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
        date: new Date().toLocaleString(),
      });
    };

    const transactionDetails = payUResponse.transaction_details[txnid];

    // ✅ If payment successful
    if (payUResponse.status === 1 && transactionDetails.status === "success") {
      const updatedPayment = await Payment.findOneAndUpdate(
        { transactionId: txnid },
        {
          paymentStatus: "Success",
          paymentDate: new Date(),
          payUResponse,
        },
        { new: true },
      );

      if (!updatedPayment) {
        return res.status(404).render("paymentFailure", {
          txnid,
          status: "Record not found",
          reason: "Payment record not found in the database.",
          date: new Date().toLocaleString(),
        });
      };

      return res.status(200).render("paymentSuccess", {
        txnid,
        amount: transactionDetails.amt,
        date: new Date().toLocaleString(),
      });
    } else {
      // ❌ Payment failed
      return res.status(400).render("paymentFailure", {
        txnid,
        status: transactionDetails.status,
        reason: transactionDetails.error_Message || "Unknown reason",
        date: new Date().toLocaleString(),
      });
    };
  } catch (error) {
    // ❌ Handle errors properly
    console.error("Payment verification error:", error.response?.data || error.message);
    return res.status(500).render("paymentFailure", {
      txnid,
      status: "Internal Server Error",
      reason: error.response?.data?.message || error.message || "Something went wrong.",
      date: new Date().toLocaleString(),
    });
  };
};

export const paymentFailure = async (req, res) => {
  const { txnid } = req.body;
  const key = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_SALT;

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
        date: new Date().toLocaleString(),
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
            paymentDate: new Date(),
            payUResponse,
          },
          { new: true },
        );

        return res.status(400).render("paymentFailure", {
          txnid,
          status,
          reason: transactionDetails.error_Message || "No reason provided by PayU.",
          date: new Date().toLocaleString(),
        });
      } else {
        // ✅ Handle unexpected payment statuses
        return res.status(400).render("paymentFailure", {
          txnid,
          status,
          reason: `Unexpected status received: ${status}`,
          date: new Date().toLocaleString(),
        });
      };
    } else {
      // ✅ Handle PayU verification failure
      return res.status(400).render("paymentFailure", {
        txnid,
        status: "Verification Failed",
        reason: "Payment verification failed from PayU side.",
        date: new Date().toLocaleString(),
      });
    };
  } catch (error) {
    // ✅ Handle internal server errors with proper logging
    console.error("Payment verification error:", error.response?.data || error.message);
    return res.status(500).render("paymentFailure", {
      txnid,
      status: "Internal Server Error",
      reason: error.response?.data?.message || error.message || "Something went wrong during verification.",
      date: new Date().toLocaleString(),
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

