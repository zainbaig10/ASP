// schemas/counterSchema.js
import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  key: {
    type: String, // e.g. "ORDER"
    required: true,
  },
  seq: {
    type: Number,
    default: 1000,
  },
});

counterSchema.index({ businessId: 1, key: 1 }, { unique: true });

export default mongoose.model("Counter", counterSchema);
