const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { User } = require("./models");
const { JWT_SECRET, NODE_ENV } = process.env;

const fail = (m, c = 400) => Object.assign(new Error(m), { status: c });
const wrap = f => (q, s, n) => Promise.resolve(f(q, s, n)).catch(n);
const str = (v, min, max, label) => { if (typeof v !== "string" || v.trim().length < min || v.trim().length > max) throw fail(`${label} must be ${min}-${max} characters`); return v.trim(); };
const auth = (...roles) => wrap(async (q, s, n) => {
  if (!q.cookies.token) throw fail("Please log in", 401);
  let id; try { id = jwt.verify(q.cookies.token, JWT_SECRET).id; } catch { throw fail("Session expired, log in again", 401); }
  const u = await User.findById(id);
  if (!u) throw fail("Account not found", 401);
  if (u.suspended) throw fail("Account suspended", 403);
  if (roles.length && !roles.includes(u.role)) throw fail("Not allowed", 403);
  q.user = u; n();
});
const sendUser = (s, u, c = 200) => {
  s.cookie("token", jwt.sign({ id: u._id }, JWT_SECRET, { expiresIn: "7d" }), { httpOnly: true, sameSite: "lax", secure: NODE_ENV === "production", maxAge: 6048e5 });
  s.status(c).json({ user: pub(u) });
};
const pub = u => ({ id: u._id, name: u.name, email: u.email, role: u.role, seller: u.role === "seller" ? { shop: u.seller.shop, approved: u.seller.approved } : undefined });
const loginLimit = rateLimit({ windowMs: 9e5, max: 10, message: { message: "Too many attempts, try later" } });

module.exports = { fail, wrap, str, auth, sendUser, pub, loginLimit };
