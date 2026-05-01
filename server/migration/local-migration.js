import "../config/env.js";
import { connectToDB, db } from "../db/connection.js";
import { ObjectId } from "mongodb";

const BATCH_SIZE = 1000;

const migrate = async () => {
  await connectToDB();

  const oldCollection = db.collection("vendors");
  const newCollection = db.collection("customers");

  const cursor = oldCollection.find({});

  let bulkOps = [];
  let total = 0;
  let skipped = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();

    if (!Array.isArray(doc.vendors)) continue;

    for (const vendor of doc.vendors) {
      try {
        let originalId = null;

        // ✅ Extract original ID safely
        if (vendor._id && ObjectId.isValid(vendor._id)) {
          originalId = new ObjectId(vendor._id);
        } else if (vendor.id && ObjectId.isValid(vendor.id)) {
          originalId = new ObjectId(vendor.id);
        }

        if (!originalId) {
          skipped++;
          continue;
        }

        // ✅ Create clean object (avoid mutating source)
        const cleanVendor = {
          ...vendor,
          _id: originalId,
        };

        delete cleanVendor.id;

        bulkOps.push({
          insertOne: {
            document: cleanVendor,
          },
        });

        total++;

        // ✅ Execute in batches
        if (bulkOps.length >= BATCH_SIZE) {
          await newCollection.bulkWrite(bulkOps, { ordered: false });
          bulkOps = [];
        }

      } catch (err) {
        console.error("❌ Error processing vendor:", err);
        skipped++;
      }
    }
  }

  // final batch
  if (bulkOps.length > 0) {
    await newCollection.bulkWrite(bulkOps, { ordered: false });
  }

  console.log("✅ Migration completed");
  console.log("Inserted:", total);
  console.log("Skipped:", skipped);
};

migrate().catch(err => {
  console.error("❌ Migration failed:", err);
});