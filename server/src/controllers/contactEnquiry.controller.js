import ContactEnquiry from "../models/contactEnquiry.model.js";

const paginateResults = (query, page, limit) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

export const createEnquiry = async (req, res) => {
  try {
    const { name, email, mobile, message, serviceType } = req.body;

    console.log(req.body);

    if (!name || !email || !mobile || !message || !serviceType) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    };

    const newEnquiry = new ContactEnquiry({ name, email, mobile, message, serviceType });
    await newEnquiry.save();

    return res.status(201).json({ success: true, message: "Enquiry submitted successfully.", data: newEnquiry });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  };
};

export const getEnquiries = async (req, res) => {
  try {
    let { search, serviceType, sortBy, order, page, limit } = req.query;

    page = Number(page);
    limit = Number(limit);
    order = order === "desc" ? -1 : 1;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
        { serviceType: { $regex: search, $options: "i" } },
      ];
    };

    if (serviceType) {
      query.serviceType = serviceType;
    };

    let enquiryQuery = ContactEnquiry.find(query);

    if (sortBy) {
      enquiryQuery = enquiryQuery.sort({ [sortBy]: order });
    } else {
      enquiryQuery = enquiryQuery.sort({ createdAt: -1 });
    };

    enquiryQuery = paginateResults(enquiryQuery, page, limit);

    const enquiries = await enquiryQuery.exec();
    const totalEnquiries = await ContactEnquiry.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: enquiries.length,
      total: totalEnquiries,
      page,
      limit,
      data: enquiries,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  };
};

export const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await ContactEnquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    };

    return res.status(200).json({ success: true, data: enquiry });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  };
};

export const updateEnquiry = async (req, res) => {
  try {
    const updatedEnquiry = await ContactEnquiry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedEnquiry) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    };

    return res.status(200).json({ success: true, message: "Enquiry updated successfully", data: updatedEnquiry });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  };
};

export const deleteEnquiry = async (req, res) => {
  try {
    const deletedEnquiry = await ContactEnquiry.findByIdAndDelete(req.params.id);

    if (!deletedEnquiry) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    };

    return res.status(200).json({ success: true, message: "Enquiry deleted successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  };
};
