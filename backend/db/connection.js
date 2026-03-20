const { MongoClient } = require("mongodb");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/factornot";

let db = null;
let client = null;

async function connectToDb() {
  if (db) return db;
  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db();
  console.log("Connected to MongoDB:", db.databaseName);
  return db;
}

function getDb() {
  if (!db) {
    throw new Error("Database not connected. Call connectToDb first.");
  }
  return db;
}

async function closeDb() {
  if (client) {
    await client.close();
    db = null;
    client = null;
  }
}

module.exports = { connectToDb, getDb, closeDb };
