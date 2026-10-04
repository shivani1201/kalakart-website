const { Schema, model } = require("mongoose");
const Id = Schema.Types.ObjectId;
const { CATS } = require("../constants");

module.exports = model("Order", new Schema({
  user: { type: Id, ref: "User", index: true }, address: String, subtotal: Number, shipping: Number, total: Number,
  payment: { type: String, default: "COD" },
  items: [{ product: Id, name: String, price: Number, qty: Number, seller: { type: Id, index: true }, shop: String, status: { type: String, default: "Placed" } }],
}, { timestamps: true }));
