const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../db/connection");
const { ensureAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const channels = await db
      .collection("channels")
      .find({})
      .sort({ name: 1 })
      .toArray();

    const countsAgg = await db
      .collection("claims")
      .aggregate([{ $group: { _id: "$channelId", count: { $sum: 1 } } }])
      .toArray();

    const countMap = {};
    countsAgg.forEach((c) => {
      countMap[c._id] = c.count;
    });

    const withCounts = channels.map((ch) => ({
      ...ch,
      claimCount: countMap[ch._id.toString()] || 0,
    }));

    res.json(withCounts);
  } catch (err) {
    console.error("GET /channels error:", err);
    res.status(500).json({ error: "Failed to fetch channels." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    let channelId;
    try {
      channelId = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ error: "Invalid channel ID." });
    }
    const channel = await db.collection("channels").findOne({ _id: channelId });
    if (!channel) return res.status(404).json({ error: "Channel not found." });
    res.json(channel);
  } catch (err) {
    console.error("GET /channels/:id error:", err);
    res.status(500).json({ error: "Failed to fetch channel." });
  }
});

router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    const { name, description, category } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Channel name is required." });
    }

    const db = getDb();
    const existing = await db
      .collection("channels")
      .findOne({ name: { $regex: `^${name.trim()}$`, $options: "i" } });

    if (existing) {
      return res
        .status(409)
        .json({ error: "A channel with that name already exists." });
    }

    const channel = {
      name: name.trim(),
      description: (description || "").trim(),
      category: (category || "General").trim(),
      author: req.user.username,
      authorId: req.user._id.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("channels").insertOne(channel);
    channel._id = result.insertedId;
    res.status(201).json(channel);
  } catch (err) {
    console.error("POST /channels error:", err);
    res.status(500).json({ error: "Failed to create channel." });
  }
});

router.put("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const db = getDb();
    let channelId;
    try {
      channelId = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ error: "Invalid channel ID." });
    }

    const channel = await db.collection("channels").findOne({ _id: channelId });
    if (!channel) return res.status(404).json({ error: "Channel not found." });
    if (channel.authorId !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You can only edit your own channels." });
    }

    const { name, description, category } = req.body;
    const updates = { updatedAt: new Date() };
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (category !== undefined) updates.category = category.trim();

    await db
      .collection("channels")
      .updateOne({ _id: channelId }, { $set: updates });

    const updated = await db.collection("channels").findOne({ _id: channelId });
    res.json(updated);
  } catch (err) {
    console.error("PUT /channels/:id error:", err);
    res.status(500).json({ error: "Failed to update channel." });
  }
});

router.delete("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const db = getDb();
    let channelId;
    try {
      channelId = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ error: "Invalid channel ID." });
    }

    const channel = await db.collection("channels").findOne({ _id: channelId });
    if (!channel) return res.status(404).json({ error: "Channel not found." });
    if (channel.authorId !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You can only delete your own channels." });
    }

    await db
      .collection("claims")
      .deleteMany({ channelId: channelId.toString() });
    await db.collection("channels").deleteOne({ _id: channelId });

    res.json({ message: "Channel and associated claims deleted." });
  } catch (err) {
    console.error("DELETE /channels/:id error:", err);
    res.status(500).json({ error: "Failed to delete channel." });
  }
});

module.exports = router;
