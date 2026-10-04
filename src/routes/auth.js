const bcrypt = require("bcryptjs");
const { CATS, STATUSES } = require("../constants");
const { User, Product, Order } = require("../models");
const { fail, wrap, str, auth, sendUser, pub, loginLimit } = require("../utils");

module.exports = (app) => {
/* Auth: role is always "customer" on register, never taken from the request */
app.post("/api/register", loginLimit, wrap(async (q, s) => {
  const name = str(q.body.name, 2, 60, "Name"), email = str(q.body.email, 5, 100, "Email").toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw fail("Enter a valid email");
  if (!/^[6-9]\d{9}$/.test(q.body.phone || "")) throw fail("Enter a valid 10-digit mobile number");
  str(q.body.password, 8, 72, "Password");
  if (await User.exists({ email })) throw fail("Email already registered", 409);
  sendUser(s, await User.create({ name, email, phone: q.body.phone, password: await bcrypt.hash(q.body.password, 12) }), 201);
}));
app.post("/api/login", loginLimit, wrap(async (q, s) => {
  const u = await User.findOne({ email: String(q.body.email || "").toLowerCase() }).select("+password");
  if (!u || !(await bcrypt.compare(String(q.body.password || ""), u.password))) throw fail("Invalid email or password", 401);
  if (u.suspended) throw fail("Account suspended", 403);
  sendUser(s, u);
}));
app.post("/api/logout", (q, s) => { s.clearCookie("token"); s.json({ ok: true }); });
app.get("/api/me", wrap(async (q, s, n) => { if (!q.cookies.token) return s.json({ user: null }); auth()(q, s, e => e ? s.json({ user: null }) : s.json({ user: pub(q.user) })); }));
};
