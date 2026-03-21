// utils/generateOrderNumber.js
import Counter from "../schemas/counterSchema.js";

export const getNextOrderNumber = async (businessId, session) => {
  // -----------------------------
  // STEP 1: ENSURE COUNTER EXISTS
  // -----------------------------
  await Counter.updateOne(
    { businessId, key: "ORDER" },
    {
      $setOnInsert: {
        seq: 1000,
      },
    },
    {
      upsert: true,
      session,
    }
  );

  // -----------------------------
  // STEP 2: INCREMENT
  // -----------------------------
  const counter = await Counter.findOneAndUpdate(
    { businessId, key: "ORDER" },
    {
      $inc: { seq: 1 },
    },
    {
      new: true,
      session,
    }
  );

  return `ORD-${counter.seq}`;
};
