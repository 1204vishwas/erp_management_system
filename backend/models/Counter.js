import mongoose from "mongoose";

// Simple atomic sequence generator for human-friendly document numbers
// (SO-0001, PO-0001, GRN-0001, INV-0001).
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

/**
 * Return the next zero-padded number for a given prefix key.
 * @param {string} key   e.g. "salesOrder"
 * @param {string} prefix e.g. "SO"
 */
export const nextSequence = async (key, prefix) => {
  const counter = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `${prefix}-${String(counter.seq).padStart(4, "0")}`;
};

export default Counter;
