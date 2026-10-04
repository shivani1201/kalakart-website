const { Schema, model } = require("mongoose");
const Id = Schema.Types.ObjectId;
const { CATS } = require("../constants");

module.exports = model("User", new Schema({
  name: String, phone: String, email: { type: String, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false }, suspended: { type: Boolean, default: false },
  role: { type: String, enum: ["customer", "seller", "admin"], default: "customer" },
  seller: { shop: String, district: String, story: String, approved: { type: Boolean, default: false } },
}, { timestamps: true }));
