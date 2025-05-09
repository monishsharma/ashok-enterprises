// db/connection.js
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = "mongodb+srv://sharmamonish17:DX2YvfTRFgPrxcKV@cluster-ae.viv07hp.mongodb.net/AEDB?retryWrites=true&w=majority&appName=Cluster-AE";

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
    process.exit(1); // Stop the app if DB fails
  }
};

const db = client.db("AEDB");
export { connectToDB, db };
