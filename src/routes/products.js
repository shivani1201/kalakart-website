const bcrypt = require("bcryptjs");
const { CATS, STATUSES } = require("../constants");
const { User, Product, Order } = require("../models");
const { fail, wrap, str, auth, sendUser, pub, loginLimit } = require("../utils");

module.exports = (app) => {
/* Public products */
app.get("/api/products", wrap(async (q, s) => {
  const f = { approved: true, archived: false };
  if (CATS.includes(q.query.category)) f.category = q.query.category;
  if (q.query.q) f.name = new RegExp(String(q.query.q).slice(0, 40).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  s.json({ products: await Product.find(f).sort("-createdAt").limit(60) });
}));
};
