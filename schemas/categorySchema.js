import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
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

    slug: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

categorySchema.index(
  { businessId: 1, slug: 1 },
  { unique: true }
);

export default mongoose.model("Category", categorySchema);
