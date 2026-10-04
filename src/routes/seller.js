const bcrypt = require("bcryptjs");
const { CATS, STATUSES } = require("../constants");
const { User, Product, Order } = require("../models");
const { fail, wrap, str, auth, sendUser, pub, loginLimit } = require("../utils");

module.exports = (app) => {
/* Seller */
app.post("/api/seller/apply", auth("customer"), wrap(async (q, s) => {
  q.user.role = "seller";
  q.user.seller = { shop: str(q.body.shop, 2, 60, "Shop name"), district: str(q.body.district, 2, 40, "District"), story: str(q.body.story, 10, 600, "Story"), approved: false };
  await q.user.save(); s.json({ user: pub(q.user) });
}));
const sellerOk = (q, s, n) => q.user.seller.approved ? n() : n(fail("Your seller account is awaiting admin approval", 403));
app.get("/api/seller/products", auth("seller"), wrap(async (q, s) => s.json({ products: await Product.find({ seller: q.user._id, archived: false }).sort("-createdAt") })));
app.post("/api/seller/products", auth("seller"), sellerOk, wrap(async (q, s) => {
  const b = q.body, price = Number(b.price), stock = Number(b.stock);
  if (!CATS.includes(b.category)) throw fail("Choose a category");
  if (!(price >= 1) || !Number.isInteger(stock) || stock < 0) throw fail("Enter a valid price and stock");
  if (b.image && !/^https:\/\/\S+$/.test(b.image)) throw fail("Image must be an https link");
  const p = await Product.create({ seller: q.user._id, shop: q.user.seller.shop, name: str(b.name, 2, 80, "Name"), description: str(b.description, 10, 400, "Description"), image: b.image || "", category: b.category, price, stock });
  s.status(201).json({ product: p }); // starts unapproved; admin must approve
}));
app.delete("/api/seller/products/:id", auth("seller"), wrap(async (q, s) => { await Product.updateOne({ _id: q.params.id, seller: q.user._id }, { archived: true }); s.json({ ok: true }); }));
app.get("/api/seller/orders", auth("seller"), wrap(async (q, s) => {
  const os = await Order.find({ "items.seller": q.user._id }).sort("-createdAt").limit(50);
  s.json({ orders: os.map(o => ({ _id: o._id, address: o.address, createdAt: o.createdAt, items: o.items.filter(i => i.seller.equals(q.user._id)) })) });
}));
app.patch("/api/seller/items/:id", auth("seller"), sellerOk, wrap(async (q, s) => {
  if (!STATUSES.includes(q.body.status)) throw fail("Invalid status");
  const r = await Order.updateOne({ items: { $elemMatch: { _id: q.params.id, seller: q.user._id } } }, { $set: { "items.$.status": q.body.status } });
  if (!r.matchedCount) throw fail("Order item not found", 404);
  s.json({ ok: true });
}));
};
