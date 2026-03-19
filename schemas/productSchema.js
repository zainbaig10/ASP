import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    name_en: {
      type: String,
      required: true,
      trim: true,
    },

    name_ar: String,

    productCode: {
      type: String,
      trim: true,
      index: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },

    description_en: String,
    description_ar: String,

    images: [String],

    variants: {
      sizes: [
        {
          type: String,
          trim: true,
        },
      ],
      colors: [
        {
          type: String,
          trim: true,
        },
      ],
      packSizes: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    badge: {
      type: String,
      enum: ["NONE", "NEW", "OFFER", "FEATURED"],
      default: "NONE",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true },
);

productSchema.index({ businessId: 1, productCode: 1 });

export default mongoose.model("Product", productSchema);
