const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { getDb } = require("../db/connection");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required." });
    }
    if (password.length < 4) {
      return res
        .status(400)
        .json({ error: "Password must be at least 4 characters." });
    }

    const db = getDb();
    const existing = await db
      .collection("users")
      .findOne({ username: username.toLowerCase() });

    if (existing) {
      return res.status(409).json({ error: "Username already taken." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await db.collection("users").insertOne({
      username: username.toLowerCase(),
      password: hashed,
      createdAt: new Date(),
    });

    const user = await db
      .collection("users")
      .findOne({ _id: result.insertedId });

    req.login(user, (err) => {
      if (err)
        return res.status(500).json({ error: "Login after register failed." });
      return res.status(201).json({
        _id: user._id,
        username: user.username,
      });
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration." });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ error: info?.message || "Login failed." });
    }
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.json({ _id: user._id, username: user.username });
    });
  })(req, res, next);
});

router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout failed." });
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out." });
    });
  });
});

router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ _id: req.user._id, username: req.user.username });
  }
  return res.status(401).json({ error: "Not authenticated." });
});

module.exports = router;
