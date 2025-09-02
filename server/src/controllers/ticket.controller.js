import Ticket from "../models/ticket.model.js";
import Project from "../models/project.model.js";

// Create a new Ticket
export const createTicket = async (req, res) => {
  try {
    const { title, description, projectId, priority, ticketType } = req.body;
    const company = req.company;
    const createdBy = req.teamId;

    const project = await Project
      .findOne({ _id: projectId, company })
      .select("responsiblePerson teamLeader")
      .lean();

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    };

    const assignedTo = [...(project.responsiblePerson || []), ...(project.teamLeader || [])];

    let image = "";

    if (req.file) {
      const file = req.file;
      image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    };

    const newTicket = new Ticket({
      title,
      description,
      project: project?._id,
      assignedTo,
      priority,
      ticketType,
      createdBy,
      image,
      company,
    });

    await newTicket.save();

    return res.status(201).json({ success: true, message: "Ticket created successfully", ticket: newTicket });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  };
};

// Fetch all tickets
export const fetchAllTickets = async (req, res) => {
  try {
    let filter = { company: req.company };
    let sort = {};

    // Check if the role is not company
    const teamRole = req.team?.role?.name?.toLowerCase();
    if (teamRole !== "company") {
      const teamId = req.team?._id;
      filter.$or = [
        { assignedTo: { $in: [teamId] } },
        { createdBy: teamId },
      ];
    };

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), "i");
      const searchFilter = [
        { ticketId: { $regex: searchRegex } },
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { status: { $regex: searchRegex } },
        { priority: { $regex: searchRegex } },
        { ticketType: { $regex: searchRegex } },
      ];

      filter.$and = [{ $or: searchFilter }];
    };

    // Handle id search
    if (req.query.ticketId) {
      filter.ticketId = { $regex: new RegExp(req.query.ticketId.trim(), 'i') };
    };

    // Handle ticketId filter
    if (req.query.ticketIdFilter) {
      filter.ticketId = { $in: Array.isArray(req.query.ticketIdFilter) ? req.query.ticketIdFilter : [req.query.ticketIdFilter] };
    };

    if (req.query.status) {
      filter.status = req.query.status;
    };

    if (req.query.priority) {
      filter.priority = req.query.priority;
    };

    if (req.query.project) {
      filter.project = req.query.project;
    };

    if (req.query.assignedTo) {
      filter.assignedTo = req.query.assignedTo;
    };

    if (req.query.sort === "Ascending") {
      sort = { createdAt: 1 };
    } else {
      sort = { createdAt: -1 };
    };

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const tickets = await Ticket
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("createdBy project assignedTo")
      .exec();

    const totalCount = await Ticket.countDocuments(filter);

    return res.status(200).json({ success: true, message: "Tickets fetched successfully", tickets, totalCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error while fetching tickets", error: error.message });
  };
};

// Fetch a single Ticket
export const fetchSingleTicket = async (req, res) => {
  try {
    const ticket = await Ticket
      .findOne({ _id: req.params.id, company: req.company })
      .populate("createdBy project assignedTo")
      .exec();

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    };

    return res.status(200).json({ success: true, message: "Ticket fetched successfully", ticket });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error while fetching ticket", error: error.message });
  };
};

// Update Ticket
export const updateTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const updateData = { ...req.body };

    if (req.file) {
      const file = req.file;
      updateData.image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    };

    const ticket = await Ticket.findOneAndUpdate({ _id: ticketId, company: req.company }, updateData, { new: true, runValidators: true });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    };

    return res.status(200).json({ success: true, message: "Ticket updated successfully", ticket });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error while updating ticket", error: error.message });
  };
};

// Delete Ticket
export const deleteTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const ticket = await Ticket.findOneAndDelete({ _id: ticketId, company: req.company });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    };

    return res.status(200).json({ success: true, message: "Ticket deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error while deleting ticket", error: error.message });
  };
};
