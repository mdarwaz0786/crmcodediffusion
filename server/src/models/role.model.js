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
      projectId: { type: FieldPermissionSchema, default: () => ({}) },
      customer: { type: FieldPermissionSchema, default: () => ({}) },
      projectType: { type: FieldPermissionSchema, default: () => ({}) },
      projectCategory: { type: FieldPermissionSchema, default: () => ({}) },
      projectTiming: { type: FieldPermissionSchema, default: () => ({}) },
      projectPriority: { type: FieldPermissionSchema, default: () => ({}) },
      projectStatus: { type: FieldPermissionSchema, default: () => ({}) },
      responsiblePerson: { type: FieldPermissionSchema, default: () => ({}) },
      teamLeader: { type: FieldPermissionSchema, default: () => ({}) },
      technology: { type: FieldPermissionSchema, default: () => ({}) },
      projectPrice: { type: FieldPermissionSchema, default: () => ({}) },
      payment: { type: FieldPermissionSchema, default: () => ({}) },
      totalPaid: { type: FieldPermissionSchema, default: () => ({}) },
      totalDues: { type: FieldPermissionSchema, default: () => ({}) },
      startDate: { type: FieldPermissionSchema, default: () => ({}) },
      endDate: { type: FieldPermissionSchema, default: () => ({}) },
      totalHour: { type: FieldPermissionSchema, default: () => ({}) },
      workDetail: { type: FieldPermissionSchema, default: () => ({}) },
      totalSpentHour: { type: FieldPermissionSchema, default: () => ({}) },
      totalRemainingHour: { type: FieldPermissionSchema, default: () => ({}) },
      description: { type: FieldPermissionSchema, default: () => ({}) },
    },
  },
);

// Invoice permission Schema
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
      invoiceId: { type: FieldPermissionSchema, default: () => ({}) },
      projects: { type: FieldPermissionSchema, default: () => ({}) },
      quantity: { type: FieldPermissionSchema, default: () => ({}) },
      tax: { type: FieldPermissionSchema, default: () => ({}) },
      CGST: { type: FieldPermissionSchema, default: () => ({}) },
      SGST: { type: FieldPermissionSchema, default: () => ({}) },
      IGST: { type: FieldPermissionSchema, default: () => ({}) },
      total: { type: FieldPermissionSchema, default: () => ({}) },
      subtotal: { type: FieldPermissionSchema, default: () => ({}) },
      balanceDue: { type: FieldPermissionSchema, default: () => ({}) },
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
      proformaInvoiceId: { type: FieldPermissionSchema, default: () => ({}) },
      date: { type: FieldPermissionSchema, default: () => ({}) },
      tax: { type: FieldPermissionSchema, default: () => ({}) },
      projects: { type: FieldPermissionSchema, default: () => ({}) },
      clientName: { type: FieldPermissionSchema, default: () => ({}) },
      GSTNumber: { type: FieldPermissionSchema, default: () => ({}) },
      shipTo: { type: FieldPermissionSchema, default: () => ({}) },
      state: { type: FieldPermissionSchema, default: () => ({}) },
      CGST: { type: FieldPermissionSchema, default: () => ({}) },
      SGST: { type: FieldPermissionSchema, default: () => ({}) },
      IGST: { type: FieldPermissionSchema, default: () => ({}) },
      total: { type: FieldPermissionSchema, default: () => ({}) },
      subtotal: { type: FieldPermissionSchema, default: () => ({}) },
      balanceDue: { type: FieldPermissionSchema, default: () => ({}) },
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
      domainExpireIn: { type: FieldPermissionSchema, default: () => ({}) },
      domainExpiryStatus: { type: FieldPermissionSchema, default: () => ({}) },
      hostingPurchaseDate: { type: FieldPermissionSchema, default: () => ({}) },
      hostingExpiryDate: { type: FieldPermissionSchema, default: () => ({}) },
      hostingExpireIn: { type: FieldPermissionSchema, default: () => ({}) },
      hostingExpiryStatus: { type: FieldPermissionSchema, default: () => ({}) },
      sslPurchaseDate: { type: FieldPermissionSchema, default: () => ({}) },
      sslExpiryDate: { type: FieldPermissionSchema, default: () => ({}) },
      sslExpireIn: { type: FieldPermissionSchema, default: () => ({}) },
      sslExpiryStatus: { type: FieldPermissionSchema, default: () => ({}) },
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
      employeeId: { type: FieldPermissionSchema, default: () => ({}) },
      name: { type: FieldPermissionSchema, default: () => ({}) },
      email: { type: FieldPermissionSchema, default: () => ({}) },
      mobile: { type: FieldPermissionSchema, default: () => ({}) },
      password: { type: FieldPermissionSchema, default: () => ({}) },
      joining: { type: FieldPermissionSchema, default: () => ({}) },
      dob: { type: FieldPermissionSchema, default: () => ({}) },
      monthlySalary: { type: FieldPermissionSchema, default: () => ({}) },
      workingHoursPerDay: { type: FieldPermissionSchema, default: () => ({}) },
      designation: { type: FieldPermissionSchema, default: () => ({}) },
      reportingTo: { type: FieldPermissionSchema, default: () => ({}) },
      role: { type: FieldPermissionSchema, default: () => ({}) },
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

// Role schema
const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
    },
    permissions: {
      project: { type: ProjectPermissionSchema, default: () => ({}) },
      invoice: { type: InvoicePermissionSchema, default: () => ({}) },
      proformaInvoice: { type: ProformaInvoicePermissionSchema, default: () => ({}) },
      purchaseInvoice: { type: PurchaseInvoicePermissionSchema, default: () => ({}) },
      projectDeployment: { type: ProjectDeploymentPermissionSchema, default: () => ({}) },
      attendance: { type: AttendancePermissionSchema, default: () => ({}) },
      customer: { type: CustomerPermissionSchema, default: () => ({}) },
      team: { type: TeamPermissionSchema, default: () => ({}) },
      role: { type: RolePermissionSchema, default: () => ({}) },
      designation: { type: DesignationPermissionSchema, default: () => ({}) },
      technology: { type: TechnologyPermissionSchema, default: () => ({}) },
      projectType: { type: ProjectTypePermissionSchema, default: () => ({}) },
      projectStatus: { type: ProjectStatusPermissionSchema, default: () => ({}) },
      projectCategory: { type: ProjectCategoryPermissionSchema, default: () => ({}) },
      projectTiming: { type: ProjectTimingPermissionSchema, default: () => ({}) },
      projectPriority: { type: ProjectPriorityPermissionSchema, default: () => ({}) },
    },
  },
  {
    timestamps: true,
  },
);

RoleSchema.pre("save", function (next) {
  // Helper function to capitalize first letter of each word
  const capitalizeWords = (str) => {
    return str.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  };

  if (this.name) {
    this.name = capitalizeWords(this.name);
  };

  next();
});

export default mongoose.model('Role', RoleSchema);

