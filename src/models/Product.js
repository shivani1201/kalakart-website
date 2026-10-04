const { Schema, model } = require("mongoose");
const Id = Schema.Types.ObjectId;
const { CATS } = require("../constants");

module.exports = model("Product", new Schema({
  seller: { type: Id, ref: "User", index: true }, shop: String, name: String, description: String, image: String,
  category: { type: String, enum: CATS }, price: { type: Number, min: 1 }, stock: { type: Number, min: 0 },
  approved: { type: Boolean, default: false }, archived: { type: Boolean, default: false },
}, { timestamps: true }));
