const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const app = require("./app");
const connectDB = require("./config/db");
const { User, Product } = require("./models");
const { MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, PORT = 5000 } = process.env;
if (!MONGODB_URI || !JWT_SECRET) { console.error("Set MONGODB_URI and JWT_SECRET in .env"); process.exit(1); }

/* ---------- Start: first admin and demo products come from .env, no public admin endpoint ---------- */
(async () => {
  await connectDB();
  if (ADMIN_EMAIL && ADMIN_PASSWORD && !(await User.exists({ role: "admin" })))
    await User.create({ name: "KalaKart Admin", email: ADMIN_EMAIL, phone: "9000000000", role: "admin", password: await bcrypt.hash(ADMIN_PASSWORD, 12) });
  const admin = await User.findOne({ role: "admin" });
  if (admin && !(await Product.countDocuments())) await Product.insertMany([
    ["Terracotta water pot", "Pottery", 450, "Hand-thrown clay pot that keeps water cool."],
    ["Paithani silk dupatta", "Handloom", 3200, "Woven silk dupatta with a traditional peacock border."],
    ["Bamboo storage basket", "Bamboo", 360, "Sturdy woven basket for home storage."],
    ["Warli wall painting", "Art", 1900, "Hand-painted Warli village scene on cloth."],
  ].map(([name, category, price, description]) => ({ seller: admin._id, shop: "KalaKart Demo Studio", name, category, price, description, stock: 10, approved: true })));
  const server = app.listen(PORT, () => console.log(`KalaKart running at http://localhost:${PORT}`));
  const stop = () => server.close(() => mongoose.connection.close().then(() => process.exit(0)));
  process.on("SIGINT", stop); process.on("SIGTERM", stop);
})();
