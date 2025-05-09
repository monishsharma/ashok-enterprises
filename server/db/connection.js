// db/connection.js
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = "your_mongo_uri_here";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const connectToDB = async () => {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // prevent server start
  }
};

const db = client.db("AEDB");

export { connectToDB, db };
