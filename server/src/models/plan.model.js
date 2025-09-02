import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: true,
  },
  isPaid: {
    type: Boolean,
    required: true,
  },
  planDetail: [{
    mrp: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
    },
    salePrice: {
      type: Number,
    },
    detail: {
      type: String,
    },
  }],
}, { timestamps: true });

planSchema.pre("save", function (next) {
  if (this.planDetail && Array.isArray(this.planDetail)) {
    this.planDetail = this.planDetail.map((detail) => {
      const discountAmount = (detail.mrp * detail.discount) / 100;
      const salePrice = detail.mrp - discountAmount;
      return {
        ...detail,
        discountAmount,
        salePrice,
      };
    });
  };
  next();
});

export default mongoose.model("Plan", planSchema);
