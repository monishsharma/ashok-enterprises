import { MongoClient, ServerApiVersion } from "mongodb";

const connection_url = "mongodb+srv://sharmamonish17:DX2YvfTRFgPrxcKV@cluster-ae.viv07hp.mongodb.net/AEDB?retryWrites=true&w=majority&appName=Cluster-AE";
const uri = connection_url || "";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

try {
  // Connect the client to the server
  await client.connect();
  // Send a ping to confirm a successful connection
  await client.db("admin").command({ ping: 1 });
  console.log(process.env.NODE_ENV)
  console.log(
   "Pinged your deployment. You successfully connected to MongoDB!"
  );
} catch(err) {
  console.error(err);
}

let db = client.db("AEDB");
export default db;