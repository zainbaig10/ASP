import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      trim: true,
    },

    notes: String,

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: String,

    salesmanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salesman",
    },

    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "QUOTATION_SENT", "CONFIRMED", "CANCELLED"],
      default: "NEW",
    },
  },
  { timestamps: true },
);

orderSchema.index({ businessId: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
