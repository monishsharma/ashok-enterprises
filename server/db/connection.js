import { MongoClient, ServerApiVersion } from "mongodb";

const connection_url = "mongodb+srv://sharmamonish17:DX2YvfTRFgPrxcKV@cluster-ae.viv07hp.mongodb.net/AEDB?retryWrites=true&w=majority&appName=Cluster-AE";
import { MongoClient, ServerApiVersion } from "mongodb";

const client = new MongoClient(connection_url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

export async function connectToDatabase() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB");
    db = client.db("AEDB");
    return db;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit so Railway sees failure
  }
}

export { db };
