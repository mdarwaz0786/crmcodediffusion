import ProjectDeployment from "../models/projectDeployment.model.js";
import mongoose from "mongoose";
import moment from "moment";

// Helper function to calculate expiry days and status
const calculateExpiry = (expiryDate) => {
  const currentDate = moment();
  const expirationDate = moment(expiryDate, "YYYY-MM-DD");
  const daysRemaining = expirationDate.diff(currentDate, "days");

  return {
    expireIn: daysRemaining > 0 ? `${daysRemaining} Days` : "Expired",
    expiryStatus: daysRemaining > 0 ? "Live" : "Expired",
  };
};

// CREATE Project Deployment
export const createProjectDeployment = async (req, res) => {
  try {
    const { websiteName, websiteLink, client, domainPurchaseDate, domainExpiryDate, hostingPurchaseDate, hostingExpiryDate, sslPurchaseDate, sslExpiryDate } = req.body;

    const { expireIn: domainExpireIn, expiryStatus: domainExpiryStatus } = calculateExpiry(domainExpiryDate);
    const { expireIn: hostingExpireIn, expiryStatus: hostingExpiryStatus } = calculateExpiry(hostingExpiryDate);
    const { expireIn: sslExpireIn, expiryStatus: sslExpiryStatus } = calculateExpiry(sslExpiryDate);

    const newProjectDeployment = new ProjectDeployment({
      websiteName,
      websiteLink,
      client,
      domainPurchaseDate,
      domainExpiryDate,
      domainExpireIn,
      domainExpiryStatus,
      hostingPurchaseDate,
      hostingExpiryDate,
      hostingExpireIn,
      hostingExpiryStatus,
      sslPurchaseDate,
      sslExpiryDate,
      sslExpireIn,
      sslExpiryStatus,
    });

    await newProjectDeployment.save();
    return res.status(201).json({ success: true, message: "Project deployment created successfully", projectDeployment: newProjectDeployment });
  } catch (error) {
    console.log("Error while creating project deployment", error.message);
    return res.status(500).json({ success: false, message: "Error while creating project deployment", error: error.message });
  };
};

// Helper function to build the projection object based on user permissions
const buildProjection = (permissions) => {
  const projectDeploymentFields = permissions.projectDeployment.fields;
  const projection = {};

  for (const [key, value] of Object.entries(projectDeploymentFields)) {
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
const filterFields = (projectDeployment, projection) => {
  const filteredProjectDeployment = {};

  for (const key in projectDeployment._doc) {
    if (projection[key] !== 0) {   // only exclude if explicitly set to 0
      filteredProjectDeployment[key] = projectDeployment[key];
    };
  };

  // Include _id, createdAt, and updatedAt if they were not excluded
  if (projection._id !== 0) {
    filteredProjectDeployment._id = projectDeployment._id;
  };

  if (projection.createdAt !== 0) {
    filteredProjectDeployment.createdAt = projectDeployment.createdAt;
  };

  if (projection.updatedAt !== 0) {
    filteredProjectDeployment.updatedAt = projectDeployment.updatedAt;
  };

  return filteredProjectDeployment;
};

// Helper function to find ObjectId by string in referenced models
const findObjectIdByString = async (modelName, fieldName, searchString) => {
  const Model = mongoose.model(modelName);
  const result = await Model.findOne({ [fieldName]: { $regex: new RegExp(searchString, 'i') } }).select('_id');
  return result ? result._id : null;
};

// Helper function to generate expiry date filters
const createExpiryFilter = (field, filterType) => {
  const currentDate = moment();
  let startDate, endDate;

  switch (filterType) {
    case 'week':
      startDate = currentDate;
      endDate = currentDate.clone().add(7, 'days');;
      break;
    case 'month':
      startDate = currentDate;
      endDate = currentDate.clone().add(30, 'days');;
      break;
    case '15days':
      startDate = currentDate;
      endDate = currentDate.clone().add(15, 'days');
      break;
    default:
      return null;
  };

  return { [field]: { $gte: startDate.format('YYYY-MM-DD'), $lte: endDate.format('YYYY-MM-DD') } };
};

// READ all Project Deployment
export const fetchAllProjectDeployment = async (req, res) => {
  try {
    let filter = {};
    let sort = {};

    // Handle universal searching across all fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { websiteName: { $regex: searchRegex } },
        { websiteLink: { $regex: searchRegex } },
        { domainPurchaseDate: { $regex: searchRegex } },
        { domainExpiryDate: { $regex: searchRegex } },
        { domainExpireIn: { $regex: searchRegex } },
        { domainExpiryStatus: { $regex: searchRegex } },
        { hostingPurchaseDate: { $regex: searchRegex } },
        { hostingExpiryDate: { $regex: searchRegex } },
        { hostingExpireIn: { $regex: searchRegex } },
        { hostingExpiryStatus: { $regex: searchRegex } },
        { sslPurchaseDate: { $regex: searchRegex } },
        { sslExpiryDate: { $regex: searchRegex } },
        { sslExpireIn: { $regex: searchRegex } },
        { sslExpiryStatus: { $regex: searchRegex } },
        { client: await findObjectIdByString('Customer', 'name', req.query.search) },
      ];
    };

    // Handle website name search
    if (req.query.name) {
      filter.websiteName = { $regex: new RegExp(req.query.name, 'i') };
    };

    // Handle website name filter
    if (req.query.nameFilter) {
      filter.websiteName = { $in: Array.isArray(req.query.nameFilter) ? req.query.nameFilter : [req.query.nameFilter] };
    };

    // Apply filters for domain, SSL, and hosting expiries
    if (req.query.domainFilter) {
      const domainExpiryFilter = createExpiryFilter('domainExpiryDate', req.query.domainFilter);
      if (domainExpiryFilter) {
        filter = { ...filter, ...domainExpiryFilter };
      };
    };

    if (req.query.sslFilter) {
      const sslExpiryFilter = createExpiryFilter('sslExpiryDate', req.query.sslFilter);
      if (sslExpiryFilter) {
        filter = { ...filter, ...sslExpiryFilter };
      };
    };

    if (req.query.hostingFilter) {
      const hostingExpiryFilter = createExpiryFilter('hostingExpiryDate', req.query.hostingFilter);
      if (hostingExpiryFilter) {
        filter = { ...filter, ...hostingExpiryFilter };
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

    const projectDeployment = await ProjectDeployment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({ path: "client", select: "" })
      .exec();

    if (!projectDeployment) {
      return res.status(404).json({ success: false, message: "Project deployment not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredProjectDeployment = projectDeployment.map((projectDeployment) => filterFields(projectDeployment, projection));
    const totalCount = await ProjectDeployment.countDocuments(filter);

    return res.status(200).json({ success: true, message: "All project deployment fetched successfully", projectDeployment: filteredProjectDeployment, totalCount });
  } catch (error) {
    console.log("Error while fetching all project deployment:", error.message)
    return res.status(500).json({ success: false, message: "Error while fetching all project deployment", error: error.message });
  };
};

// READ single Project Deployment by ID
export const fetchSingleProjectDeployment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid project deployment ID" });
    };

    const projectDeployment = await ProjectDeployment.findById(id)
      .populate({ path: "client", select: "" })
      .exec();

    if (!projectDeployment) {
      return res.status(404).json({ success: false, message: "Project deployment not found" });
    };

    const permissions = req.team.role.permissions;
    const projection = buildProjection(permissions);
    const filteredProjectDeployment = filterFields(projectDeployment, projection);

    return res.status(200).json({ success: true, message: "Single project deployment fetched successfully", projectDeployment: filteredProjectDeployment });
  } catch (error) {
    console.log("Error while fetching single project deployment:", error.message)
    return res.status(500).json({ success: false, message: "Error while fetching single project deployment", error: error.message });
  };
};

// UPDATE Project Deployment
export const updateProjectDeployment = async (req, res) => {
  try {
    const { id } = req.params;
    const { websiteName, websiteLink, client, domainPurchaseDate, domainExpiryDate, hostingPurchaseDate, hostingExpiryDate, sslPurchaseDate, sslExpiryDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid project deployment ID" });
    };

    const { expireIn: domainExpireIn, expiryStatus: domainExpiryStatus } = calculateExpiry(domainExpiryDate);
    const { expireIn: hostingExpireIn, expiryStatus: hostingExpiryStatus } = calculateExpiry(hostingExpiryDate);
    const { expireIn: sslExpireIn, expiryStatus: sslExpiryStatus } = calculateExpiry(sslExpiryDate);

    const updatedProjectDeployment = await ProjectDeployment.findByIdAndUpdate(
      id,
      {
        websiteName,
        websiteLink,
        client,
        domainPurchaseDate,
        domainExpiryDate,
        domainExpireIn,
        domainExpiryStatus,
        hostingPurchaseDate,
        hostingExpiryDate,
        hostingExpireIn,
        hostingExpiryStatus,
        sslPurchaseDate,
        sslExpiryDate,
        sslExpireIn,
        sslExpiryStatus,
      },
      { new: true },
    );

    if (!updatedProjectDeployment) {
      return res.status(404).json({ success: false, message: "Project deployment not found" });
    };

    return res.status(200).json({ success: true, message: "Project deployment updated successfully", updatedProjectDeployment });
  } catch (error) {
    console.log("Error while updating project deployment:", error.message);
    res.status(500).json({ success: false, message: "Error while updating project deployment", error: error.message });
  };
};

// DELETE Project Deployment
export const deleteProjectDeployment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid project deployment ID" });
    };

    const deletedProjectDeployment = await ProjectDeployment.findByIdAndDelete(id);

    if (!deletedProjectDeployment) {
      return res.status(404).json({ success: false, message: "Project deployment not found" });
    };

    return res.status(200).json({ success: true, message: "Project deployment deleted successfully" });
  } catch (error) {
    console.log("Error while deleting project deployment:", error.message)
    return res.status(500).json({ success: false, message: "Error while deleting project deployment", error: error.message });
  };
};
