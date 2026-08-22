import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const ROLES = ["Admin", "Sales", "Purchase", "Inventory"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ROLES, default: "Sales" },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving when it has been modified.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare a plaintext password with the stored hash.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
