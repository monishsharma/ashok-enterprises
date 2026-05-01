import "./config/env.js";
import { connectToDB, db } from "./db/connection.js";

function extractSize(type) {
  const match = type.match(/\d+/);
  return match ? parseInt(match[0]) : null;
}

function parseType(type = "") {
  const lower = type.toLowerCase();

  if (["LPT", "Pauwels", "Channel"].includes(type)) return {
    code: "FRAME",
  };

  return {
    code: "ROLLER",
    size: extractSize(type),
    edgeType: lower.includes("flange") ? "FLANGE" : "PLAIN",
    paint: lower.includes("paint"),
    bearing: lower.includes("bearing"),
    dryType: lower.includes("dry")
  };
}

async function migratePO() {
  try {
    await connectToDB();

    const collection = db.collection("vendors");

    const vendors = await collection.find({}).toArray();

    for (const doc of vendors) {
      let updated = false;

      const updatedVendors = (doc.vendors || []).map(vendor => {
        const updatedSupplyRate = (vendor.supplyRate || []).map(item => {

          // Skip already migrated
          if (item.code && item.size) return item;

          const parsed = parseType(item.type || "");

          // Skip non-rollers
          if (!parsed) return item;

          if (!parsed.size) {
            console.warn("⚠️ Size NOT detected for:", item.type);
          }

          updated = true;

          return {
            ...item,
            ...parsed
          };
        });

        return {
          ...vendor,
          supplyRate: updatedSupplyRate
        };
      });

      if (updated) {
        await collection.updateOne(
          { _id: doc._id },
          { $set: { vendors: updatedVendors } }
        );

        console.log(`✅ Updated vendor: ${doc._id}`);
      }
    }

    console.log("\n🎉 Migration completed");
    process.exit(0);

  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migratePO();