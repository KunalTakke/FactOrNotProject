const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../db/connection");
const { ensureAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const filter = {};
    if (req.query.channelId) {
      filter.channelId = req.query.channelId;
    }

    // USABILITY FIX: Improved search - split query into individual words
    // so "water glasses" matches claims containing both words in any order
    if (req.query.search) {
      const words = req.query.search.trim().split(/\s+/).filter(Boolean);
      if (words.length === 1) {
        filter.title = { $regex: words[0], $options: "i" };
      } else if (words.length > 1) {
        filter.$and = words.map((word) => ({
          title: { $regex: word, $options: "i" },
        }));
      }
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    let sortStage;
    if (req.query.sort === "newest") {
      sortStage = { createdAt: -1 };
    } else if (req.query.sort === "contested") {
      // USABILITY FIX: Most Contested sort
      // Uses aggregation to sort by distance from 50%
      // Claims nearest to 50% appear first (most divided)
      const pipeline = [
        { $match: filter },
        {
          $addFields: {
            contestedScore: {
              $abs: { $subtract: ["$credibilityScore", 50] },
            },
          },
        },
        { $sort: { contestedScore: 1, totalVotes: -1 } },
        {
          $facet: {
            claims: [{ $skip: skip }, { $limit: limit }],
            total: [{ $count: "count" }],
          },
        },
      ];

      const [result] = await db
        .collection("claims")
        .aggregate(pipeline)
        .toArray();
      const claims = result.claims || [];
      const total = result.total[0]?.count || 0;

      return res.json({
        claims,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } else {
      // Default: highest credibility first
      sortStage = { credibilityScore: -1 };
    }

    const [claims, total] = await Promise.all([
      db
        .collection("claims")
        .find(filter)
        .sort(sortStage)
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("claims").countDocuments(filter),
    ]);

    res.json({ claims, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("GET /claims error:", err);
    res.status(500).json({ error: "Failed to fetch claims." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    let claimId;
    try {
      claimId = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ error: "Invalid claim ID." });
    }
    const claim = await db.collection("claims").findOne({ _id: claimId });
    if (!claim) return res.status(404).json({ error: "Claim not found." });
    res.json(claim);
  } catch (err) {
    console.error("GET /claims/:id error:", err);
    res.status(500).json({ error: "Failed to fetch claim." });
  }
});

router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    const { title, description, channelId, sourceUrl } = req.body;
    if (!title || !channelId) {
      return res.status(400).json({ error: "Title and channel are required." });
    }

    const db = getDb();

    let chId;
    try {
      chId = new ObjectId(channelId);
    } catch {
      return res.status(400).json({ error: "Invalid channel ID." });
    }
    const channel = await db.collection("channels").findOne({ _id: chId });
    if (!channel) return res.status(404).json({ error: "Channel not found." });

    const claim = {
      title: title.trim(),
      description: (description || "").trim(),
      sourceUrl: (sourceUrl || "").trim(),
      channelId: channelId,
      channelName: channel.name,
      author: req.user.username,
      authorId: req.user._id.toString(),
      factVotes: 0,
      notVotes: 0,
      totalVotes: 0,
      credibilityScore: 50,
      voters: {},
      evidence: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("claims").insertOne(claim);
    claim._id = result.insertedId;
    res.status(201).json(claim);
  } catch (err) {
    console.error("POST /claims error:", err);
    res.status(500).json({ error: "Failed to create claim." });
  }
});

router.put("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const db = getDb();
    let claimId;
    try {
      claimId = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ error: "Invalid claim ID." });
    }

    const claim = await db.collection("claims").findOne({ _id: claimId });
    if (!claim) return res.status(404).json({ error: "Claim not found." });
    if (claim.authorId !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You can only edit your own claims." });
    }

    const { title, description, sourceUrl } = req.body;
    const updates = { updatedAt: new Date() };
    if (title) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (sourceUrl !== undefined) updates.sourceUrl = sourceUrl.trim();

    await db
      .collection("claims")
      .updateOne({ _id: claimId }, { $set: updates });

    const updated = await db.collection("claims").findOne({ _id: claimId });
    res.json(updated);
  } catch (err) {
    console.error("PUT /claims/:id error:", err);
    res.status(500).json({ error: "Failed to update claim." });
  }
});

router.delete("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const db = getDb();
    let claimId;
    try {
      claimId = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ error: "Invalid claim ID." });
    }

    const claim = await db.collection("claims").findOne({ _id: claimId });
    if (!claim) return res.status(404).json({ error: "Claim not found." });
    if (claim.authorId !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You can only delete your own claims." });
    }

    await db.collection("claims").deleteOne({ _id: claimId });
    res.json({ message: "Claim deleted." });
  } catch (err) {
    console.error("DELETE /claims/:id error:", err);
    res.status(500).json({ error: "Failed to delete claim." });
  }
});

router.post("/:id/vote", ensureAuthenticated, async (req, res) => {
  try {
    const { vote } = req.body;
    if (vote !== "fact" && vote !== "not") {
      return res.status(400).json({ error: "Vote must be 'fact' or 'not'." });
    }

    const db = getDb();
    let claimId;
    try {
      claimId = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ error: "Invalid claim ID." });
    }

    const claim = await db.collection("claims").findOne({ _id: claimId });
    if (!claim) return res.status(404).json({ error: "Claim not found." });

    const userKey = `voters.${req.user._id.toString()}`;
    const previousVote = claim.voters?.[req.user._id.toString()];

    let inc = {};

    if (previousVote === vote) {
      inc = {
        [`${vote}Votes`]: -1,
        totalVotes: -1,
      };
      const unsetUpdate = { $inc: inc, $unset: { [userKey]: "" } };
      await db.collection("claims").updateOne({ _id: claimId }, unsetUpdate);
    } else {
      if (previousVote) {
        inc[`${previousVote}Votes`] = -1;
        inc[`${vote}Votes`] = 1;
      } else {
        inc[`${vote}Votes`] = 1;
        inc.totalVotes = 1;
      }
      await db.collection("claims").updateOne(
        { _id: claimId },
        {
          $inc: inc,
          $set: { [userKey]: vote },
        }
      );
    }

    const updated = await db.collection("claims").findOne({ _id: claimId });
    let credibilityScore = 50;
    if (updated.totalVotes > 0) {
      credibilityScore = Math.round(
        (updated.factVotes / updated.totalVotes) * 100
      );
    }
    await db
      .collection("claims")
      .updateOne({ _id: claimId }, { $set: { credibilityScore } });

    const final = await db.collection("claims").findOne({ _id: claimId });
    res.json(final);
  } catch (err) {
    console.error("POST /claims/:id/vote error:", err);
    res.status(500).json({ error: "Failed to record vote." });
  }
});

router.post("/:id/evidence", ensureAuthenticated, async (req, res) => {
  try {
    const { comment, sourceUrl, supports } = req.body;
    if (!comment) {
      return res.status(400).json({ error: "Comment text is required." });
    }

    const db = getDb();
    let claimId;
    try {
      claimId = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ error: "Invalid claim ID." });
    }

    const claim = await db.collection("claims").findOne({ _id: claimId });
    if (!claim) return res.status(404).json({ error: "Claim not found." });

    const evidence = {
      _id: new ObjectId(),
      comment: comment.trim(),
      sourceUrl: (sourceUrl || "").trim(),
      supports: supports === true || supports === "true",
      author: req.user.username,
      authorId: req.user._id.toString(),
      createdAt: new Date(),
    };

    await db
      .collection("claims")
      .updateOne({ _id: claimId }, { $push: { evidence } });

    const updated = await db.collection("claims").findOne({ _id: claimId });
    res.status(201).json(updated);
  } catch (err) {
    console.error("POST /claims/:id/evidence error:", err);
    res.status(500).json({ error: "Failed to add evidence." });
  }
});

module.exports = router;
