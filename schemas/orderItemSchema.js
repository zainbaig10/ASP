import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    // ✅ IMPORTANT
    variant: {
      size: String,
      color: String,
      packSize: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("OrderItem", orderItemSchema);
