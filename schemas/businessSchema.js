import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    logo: String,

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    phone: String,

    address: String,

    country: String,

    currency: {
      type: String,
      default: "SAR",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Business", businessSchema);
