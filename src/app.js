const cors = require("cors");
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const app = express();
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
);
app.use(rateLimit({ windowMs: 9e5, max: 400 }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "20kb" }), cookieParser());

app.get("/api/health", (q, s) => s.json({ status: "ok" }));
["auth", "products", "seller", "orders", "admin"].forEach((r) =>
  require("./routes/" + r)(app),
);
app.use(express.static(path.join(__dirname, "../public")));

app.use((q, s) => s.status(404).json({ message: "Not found" }));
app.use((e, q, s, n) => {
  const st =
    e.code === 11000
      ? 409
      : e.name === "CastError" || e.name === "ValidationError"
        ? 400
        : e.status || 500;
  if (st === 500) console.error(e);
  s.status(st).json({
    message:
      st === 500
        ? "Something went wrong"
        : e.code === 11000
          ? "Already exists"
          : e.name === "CastError"
            ? "Invalid id"
            : e.message,
  });
});

module.exports = app;
