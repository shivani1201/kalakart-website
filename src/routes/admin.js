const bcrypt = require("bcryptjs");
const { CATS, STATUSES } = require("../constants");
const { User, Product, Order } = require("../models");
const { fail, wrap, str, auth, sendUser, pub, loginLimit } = require("../utils");

module.exports = (app) => {
/* Admin */
app.get("/api/admin/overview", auth("admin"), wrap(async (q, s) => {
  const [customers, orders, gmv, sellers, products] = await Promise.all([
    User.countDocuments({ role: "customer" }), Order.countDocuments(), Order.aggregate([{ $group: { _id: null, t: { $sum: "$total" } } }]),
    User.find({ role: "seller", "seller.approved": false }).select("name email seller"), Product.find({ approved: false, archived: false }).select("name price shop")]);
  s.json({ customers, orders, gmv: gmv[0]?.t || 0, sellers, products });
}));
app.patch("/api/admin/sellers/:id", auth("admin"), wrap(async (q, s) => {
  await User.updateOne({ _id: q.params.id, role: "seller" }, q.body.approve === true ? { "seller.approved": true } : { role: "customer", seller: {} });
  s.json({ ok: true });
}));
app.patch("/api/admin/products/:id", auth("admin"), wrap(async (q, s) => {
  await Product.updateOne({ _id: q.params.id }, q.body.approve === true ? { approved: true } : { archived: true });
  s.json({ ok: true });
}));
};
