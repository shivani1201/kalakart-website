const bcrypt = require("bcryptjs");
const { CATS, STATUSES } = require("../constants");
const { User, Product, Order } = require("../models");
const { fail, wrap, str, auth, sendUser, pub, loginLimit } = require("../utils");

module.exports = (app) => {
/* Customer orders: server recalculates price and reserves stock atomically */
app.post("/api/orders", auth(), wrap(async (q, s) => {
  const { items } = q.body, address = str(q.body.address, 10, 300, "Address");
  if (!Array.isArray(items) || !items.length || items.length > 30) throw fail("Your cart is empty");
  const taken = [], lines = [];
  try {
    for (const it of items) {
      const n = Number(it.qty);
      if (!Number.isInteger(n) || n < 1 || n > 20) throw fail("Invalid quantity");
      const p = await Product.findOneAndUpdate({ _id: it.id, approved: true, archived: false, stock: { $gte: n } }, { $inc: { stock: -n } });
      if (!p) throw fail("An item is out of stock or no longer available");
      taken.push([p._id, n]);
      lines.push({ product: p._id, name: p.name, price: p.price, qty: n, seller: p.seller, shop: p.shop });
    }
    const subtotal = lines.reduce((t, l) => t + l.price * l.qty, 0), shipping = subtotal >= 999 ? 0 : 50;
    s.status(201).json({ order: await Order.create({ user: q.user._id, items: lines, subtotal, shipping, total: subtotal + shipping, address }) });
  } catch (e) { for (const [id, n] of taken) await Product.updateOne({ _id: id }, { $inc: { stock: n } }); throw e; }
}));
app.get("/api/orders/my", auth(), wrap(async (q, s) => s.json({ orders: await Order.find({ user: q.user._id }).sort("-createdAt").limit(50) })));
};
