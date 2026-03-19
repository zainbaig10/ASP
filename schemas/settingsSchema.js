import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      unique: true,
    },

    companyName: String,

    logo: String,

    email: String,

    phone: String,

    themeColor: {
      type: String,
      default: "#3B82F6",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
