import mongoose from "mongoose";

// Field permission schema
const FieldPermissionSchema = new mongoose.Schema(
  {
    read: {
      type: Boolean,
      default: true,
    },
    show: {
      type: Boolean,
      default: true,
    },
  },
);

// Project permission Schema
const ProjectPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      projectName: { type: FieldPermissionSchema, default: () => ({}) },
      customer: { type: FieldPermissionSchema, default: () => ({}) },
      projectType: { type: FieldPermissionSchema, default: () => ({}) },
      projectCategory: { type: FieldPermissionSchema, default: () => ({}) },
      projectPriority: { type: FieldPermissionSchema, default: () => ({}) },
      projectStatus: { type: FieldPermissionSchema, default: () => ({}) },
      responsiblePerson: { type: FieldPermissionSchema, default: () => ({}) },
      teamLeader: { type: FieldPermissionSchema, default: () => ({}) },
      technology: { type: FieldPermissionSchema, default: () => ({}) },
      projectPrice: { type: FieldPermissionSchema, default: () => ({}) },
      projectDeadline: { type: FieldPermissionSchema, default: () => ({}) },
      totalHour: { type: FieldPermissionSchema, default: () => ({}) },
      description: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Tax Invoice permission Schema
const InvoicePermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      amount: { type: FieldPermissionSchema, default: () => ({}) },
      tax: { type: FieldPermissionSchema, default: () => ({}) },
      date: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Proforma invoice permission Schema
const ProformaInvoicePermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      tax: { type: FieldPermissionSchema, default: () => ({}) },
      projectCost: { type: FieldPermissionSchema, default: () => ({}) },
      date: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Attendance permission Schema
const AttendancePermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      employee: { type: FieldPermissionSchema, default: () => ({}) },
      holiday: { type: FieldPermissionSchema, default: () => ({}) },
      settings: { type: FieldPermissionSchema, default: () => ({}) },
      service: { type: FieldPermissionSchema, default: () => ({}) },
      salarySlip: { type: FieldPermissionSchema, default: () => ({}) },
      leaveBalance: { type: FieldPermissionSchema, default: () => ({}) },
      writeWorkSummary: { type: FieldPermissionSchema, default: () => ({}) },
      applyLeave: { type: FieldPermissionSchema, default: () => ({}) },
      applyMissedPunchOut: { type: FieldPermissionSchema, default: () => ({}) },
      applyLatePunchIn: { type: FieldPermissionSchema, default: () => ({}) },
      applyCompOff: { type: FieldPermissionSchema, default: () => ({}) },
      project: { type: FieldPermissionSchema, default: () => ({}) },
      taxInvoice: { type: FieldPermissionSchema, default: () => ({}) },
      proformaInvoice: { type: FieldPermissionSchema, default: () => ({}) },
      ticket: { type: FieldPermissionSchema, default: () => ({}) },
      aboutUs: { type: FieldPermissionSchema, default: () => ({}) },
      contactUs: { type: FieldPermissionSchema, default: () => ({}) },
      helpAndSupport: { type: FieldPermissionSchema, default: () => ({}) },
      attendance: { type: FieldPermissionSchema, default: () => ({}) },
      workSummary: { type: FieldPermissionSchema, default: () => ({}) },
      approval: { type: FieldPermissionSchema, default: () => ({}) },
      message: { type: FieldPermissionSchema, default: () => ({}) },
      upcomingHoliday: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Purchase invoice permission Schema
const PurchaseInvoicePermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      name: { type: FieldPermissionSchema, default: () => ({}) },
      amount: { type: FieldPermissionSchema, default: () => ({}) },
      date: { type: FieldPermissionSchema, default: () => ({}) },
      bill: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Project deployment permission Schema
const ProjectDeploymentPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      websiteName: { type: FieldPermissionSchema, default: () => ({}) },
      websiteLink: { type: FieldPermissionSchema, default: () => ({}) },
      client: { type: FieldPermissionSchema, default: () => ({}) },
      domainPurchaseDate: { type: FieldPermissionSchema, default: () => ({}) },
      domainExpiryDate: { type: FieldPermissionSchema, default: () => ({}) },
      hostingPurchaseDate: { type: FieldPermissionSchema, default: () => ({}) },
      hostingExpiryDate: { type: FieldPermissionSchema, default: () => ({}) },
      sslPurchaseDate: { type: FieldPermissionSchema, default: () => ({}) },
      sslExpiryDate: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Customer permission Schema
const CustomerPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      name: { type: FieldPermissionSchema, default: () => ({}) },
      email: { type: FieldPermissionSchema, default: () => ({}) },
      mobile: { type: FieldPermissionSchema, default: () => ({}) },
      GSTNumber: { type: FieldPermissionSchema, default: () => ({}) },
      companyName: { type: FieldPermissionSchema, default: () => ({}) },
      state: { type: FieldPermissionSchema, default: () => ({}) },
      address: { type: FieldPermissionSchema, default: () => ({}) },
      password: { type: FieldPermissionSchema, default: () => ({}) },
      role: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Ticket permission Schema
const TicketPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      status: { type: FieldPermissionSchema, default: () => ({}) },
      assignedTo: { type: FieldPermissionSchema, default: () => ({}) },
      resolutionDetails: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Designation permission Schema
const DesignationPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      name: { type: FieldPermissionSchema, default: () => ({}) },
      description: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Department permission Schema
const DepartmentPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      name: { type: FieldPermissionSchema, default: () => ({}) },
      description: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Project category permission Schema
const ProjectCategoryPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      name: { type: FieldPermissionSchema, default: () => ({}) },
      description: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Project Status permission Schema
const ProjectStatusPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      status: { type: FieldPermissionSchema, default: () => ({}) },
      description: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Project timing permission Schema
const ProjectTimingPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      name: { type: FieldPermissionSchema, default: () => ({}) },
      description: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Project priority permission Schema
const ProjectPriorityPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      name: { type: FieldPermissionSchema, default: () => ({}) },
      description: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Project type permission Schema
const ProjectTypePermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      name: { type: FieldPermissionSchema, default: () => ({}) },
      description: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Team permission Schema
const TeamPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      name: { type: FieldPermissionSchema, default: () => ({}) },
      email: { type: FieldPermissionSchema, default: () => ({}) },
      mobile: { type: FieldPermissionSchema, default: () => ({}) },
      password: { type: FieldPermissionSchema, default: () => ({}) },
      joining: { type: FieldPermissionSchema, default: () => ({}) },
      dob: { type: FieldPermissionSchema, default: () => ({}) },
      monthlySalary: { type: FieldPermissionSchema, default: () => ({}) },
      UAN: { type: FieldPermissionSchema, default: () => ({}) },
      PAN: { type: FieldPermissionSchema, default: () => ({}) },
      bankAccount: { type: FieldPermissionSchema, default: () => ({}) },
      workingHoursPerDay: { type: FieldPermissionSchema, default: () => ({}) },
      designation: { type: FieldPermissionSchema, default: () => ({}) },
      office: { type: FieldPermissionSchema, default: () => ({}) },
      department: { type: FieldPermissionSchema, default: () => ({}) },
      role: { type: FieldPermissionSchema, default: () => ({}) },
      reportingTo: { type: FieldPermissionSchema, default: () => ({}) },
      isActive: { type: FieldPermissionSchema, default: () => ({}) },
      allowMultiDevice: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Technology permission Schema
const TechnologyPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      name: { type: FieldPermissionSchema, default: () => ({}) },
      description: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Add on service permission Schema
const AddOnServicePermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      clientName: { type: FieldPermissionSchema, default: () => ({}) },
      projectName: { type: FieldPermissionSchema, default: () => ({}) },
      serviceName: { type: FieldPermissionSchema, default: () => ({}) },
      totalProjectCost: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Service permission Schema
const ServicePermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      name: { type: FieldPermissionSchema, default: () => ({}) },
      description: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Salary permission Schema
const SalaryPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      transactionId: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Holiday permission Schema
const HolidayPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      reason: { type: FieldPermissionSchema, default: () => ({}) },
      date: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Leave approval permission Schema
const LeaveApprovalPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      leaveStatus: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Role permission Schema
const RolePermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      name: { type: FieldPermissionSchema, default: () => ({}) },
      permissions: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Office permission Schema
const OfficePermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      uniqueCode: { type: FieldPermissionSchema, default: () => ({}) },
      name: { type: FieldPermissionSchema, default: () => ({}) },
      websiteLink: { type: FieldPermissionSchema, default: () => ({}) },
      logo: { type: FieldPermissionSchema, default: () => ({}) },
      email: { type: FieldPermissionSchema, default: () => ({}) },
      noReplyEmail: { type: FieldPermissionSchema, default: () => ({}) },
      noReplyEmailAppPassword: { type: FieldPermissionSchema, default: () => ({}) },
      contact: { type: FieldPermissionSchema, default: () => ({}) },
      GSTNumber: { type: FieldPermissionSchema, default: () => ({}) },
      accountNumber: { type: FieldPermissionSchema, default: () => ({}) },
      accountName: { type: FieldPermissionSchema, default: () => ({}) },
      accountType: { type: FieldPermissionSchema, default: () => ({}) },
      bankName: { type: FieldPermissionSchema, default: () => ({}) },
      IFSCCode: { type: FieldPermissionSchema, default: () => ({}) },
      latitude: { type: FieldPermissionSchema, default: () => ({}) },
      longitude: { type: FieldPermissionSchema, default: () => ({}) },
      attendanceRadius: { type: FieldPermissionSchema, default: () => ({}) },
      addressLine1: { type: FieldPermissionSchema, default: () => ({}) },
      addressLine2: { type: FieldPermissionSchema, default: () => ({}) },
      addressLine3: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Notification Permission Schema
const NotificationPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      message: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Work Summary Permission Schema
const WorkSummaryPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      summary: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Payment Permission Schema
const PaymentPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      projectName: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Missed Punch Out Permission Schema
const MissedPunchOutPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      status: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Late Punch In Permission Schema
const LatePunchInPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      status: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Comp Off Permission Schema
const CompOffPermissionSchema = new mongoose.Schema(
  {
    access: {
      type: Boolean,
      default: false,
    },
    export: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    fields: {
      status: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Role schema
const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      index: true,
    },
    permissions: {
      project: { type: ProjectPermissionSchema, default: () => ({}) },
      invoice: { type: InvoicePermissionSchema, default: () => ({}) },
      proformaInvoice: { type: ProformaInvoicePermissionSchema, default: () => ({}) },
      purchaseInvoice: { type: PurchaseInvoicePermissionSchema, default: () => ({}) },
      projectDeployment: { type: ProjectDeploymentPermissionSchema, default: () => ({}) },
      attendance: { type: AttendancePermissionSchema, default: () => ({}) },
      customer: { type: CustomerPermissionSchema, default: () => ({}) },
      ticket: { type: TicketPermissionSchema, default: () => ({}) },
      team: { type: TeamPermissionSchema, default: () => ({}) },
      role: { type: RolePermissionSchema, default: () => ({}) },
      designation: { type: DesignationPermissionSchema, default: () => ({}) },
      department: { type: DepartmentPermissionSchema, default: () => ({}) },
      technology: { type: TechnologyPermissionSchema, default: () => ({}) },
      holiday: { type: HolidayPermissionSchema, default: () => ({}) },
      addOnService: { type: AddOnServicePermissionSchema, default: () => ({}) },
      service: { type: ServicePermissionSchema, default: () => ({}) },
      salary: { type: SalaryPermissionSchema, default: () => ({}) },
      missedPunchOut: { type: MissedPunchOutPermissionSchema, default: () => ({}) },
      latePunchIn: { type: LatePunchInPermissionSchema, default: () => ({}) },
      leaveApproval: { type: LeaveApprovalPermissionSchema, default: () => ({}) },
      compOff: { type: CompOffPermissionSchema, default: () => ({}) },
      projectType: { type: ProjectTypePermissionSchema, default: () => ({}) },
      projectStatus: { type: ProjectStatusPermissionSchema, default: () => ({}) },
      projectCategory: { type: ProjectCategoryPermissionSchema, default: () => ({}) },
      projectPriority: { type: ProjectPriorityPermissionSchema, default: () => ({}) },
      office: { type: OfficePermissionSchema, default: () => ({}) },
      notification: { type: NotificationPermissionSchema, default: () => ({}) },
      workSummary: { type: WorkSummaryPermissionSchema, default: () => ({}) },
      payment: { type: PaymentPermissionSchema, default: () => ({}) },
    },
  },
  {
    timestamps: true,
  },
);

RoleSchema.pre("save", function (next) {
  const capitalizeWords = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (this.name) {
    this.name = capitalizeWords(this.name);
  };

  next();
});

RoleSchema.index({ name: 1, company: 1 }, { unique: true });

export default mongoose.model('Role', RoleSchema);

