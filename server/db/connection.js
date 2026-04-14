// db/connection.js
import { MongoClient, ServerApiVersion } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

const connectToDB = async () => {
  try {
    await client.connect();

    db = client.db(); // DB comes from URI

    await db.collection("purchaseOrders").createIndex(
      { company: 1, poNumber: 1 },
      { unique: true }
    );
console.log("Connected DB:", db.databaseName);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

export { connectToDB, db };