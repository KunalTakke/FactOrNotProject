const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const { connectToDb } = require("./db/connection");
const passport = require("./middleware/passport");
const authRoutes = require("./routes/auth");
const claimsRoutes = require("./routes/claims");
const channelsRoutes = require("./routes/channels");

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/factornot";

/* ---- Middleware ---- */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "factornot-secret-key-change-in-prod",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, /* 1 day */
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ---- API Routes ---- */
app.use("/api/auth", authRoutes);
app.use("/api/claims", claimsRoutes);
app.use("/api/channels", channelsRoutes);

/* ---- Serve React Build (production) ---- */
const buildPath = path.join(__dirname, "..", "frontend", "build");
app.use(express.static(buildPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

/* ---- Start ---- */
async function start() {
  try {
    await connectToDb();
    app.listen(PORT, () => {
      console.log(`FactOrNot server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
