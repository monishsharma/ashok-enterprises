// db/connection.js
import { MongoClient, ServerApiVersion } from "mongodb";
import dns from "node:dns/promises"; // Or use require() for CommonJS
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

const client = new MongoClient(process.env.MONGO_URI, {
  family: 4,
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