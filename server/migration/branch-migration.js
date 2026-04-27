// import "../config/env.js";
// import { connectToDB, db } from "../db/connection.js";


// async function migratePO() {
//   try {
//     await connectToDB();

//     const result = await db.collection("invoices").updateMany(
//     {"company": "ASHOK"},
//     {
//         $set: {
//         "buyerDetail.branch": "69e89001ca79710da73751f9"
//         }
//     }
//     );

//     console.log("Updated:", result.modifiedCount);
//     process.exit(0);

//   } catch (err) {
//     console.error("❌ Migration failed:", err);
//     process.exit(1);
//   }
// }

// migratePO();

import "../config/env.js";
import { connectToDB, db } from "../db/connection.js";

function normalize(str = "") {
  return str.toLowerCase().replace(/\s+/g, "").replace(/[^a-z]/g, "");
}

function resolveVendorAndBranch(invoice, allVendors) {
  const name = normalize(invoice?.buyerDetail?.customerName);
  const address = normalize(invoice?.buyerDetail?.address);

  for (const vendor of allVendors) {
    if (!vendor.plantRows) continue;

    let plant = vendor.plantRows.find(
      (p) => normalize(p.label) === name
    );
    if (plant) return { vendorId: vendor.id, branchId: plant.id, customerName: plant.label };

    plant = vendor.plantRows.find(
      (p) =>
        normalize(p.label).includes(name) ||
        name.includes(normalize(p.label))
    );
    if (plant) return { vendorId: vendor.id, branchId: plant.id, customerName: plant.label };

    plant = vendor.plantRows.find(
      (p) =>
        normalize(p.address).includes(address) ||
        address.includes(normalize(p.address))
    );
    if (plant) return { vendorId: vendor.id, branchId: plant.id, customerName: plant.label };

    // vendor fallback
    if (normalize(vendor.label) === name) {
      if (vendor.plantRows.length > 0) {
        return {
          vendorId: vendor.id,
          branchId: vendor.plantRows[0].id,
            customerName: vendor.plantRows[0].label
        };
      }
    }
  }

  return null;
}

async function migrateAllInvoices() {
  try {
    await connectToDB();

    const root = await db.collection("vendors").findOne({});
    const allVendors = root.vendors;

    const invoices = await db
      .collection("invoices")
      .find({ company: "PADMA" })
      .toArray();

    console.log(`📦 Total invoices: ${invoices.length}`);

    let success = 0;
    let failed = 0;

    for (const invoice of invoices) {
      const result = resolveVendorAndBranch(invoice, allVendors);

      if (!result) {
        console.log("❌ FAILED:", {
          id: invoice._id,
          name: invoice?.buyerDetail?.customerName
        });
        failed++;
        continue;
      }

      await db.collection("invoices").updateOne(
        { _id: invoice._id },
        {
          $set: {
            "buyerDetail.customer": result.vendorId,
            "buyerDetail.branch": result.branchId
          }
        }
      );

      success++;
    }

    console.log("\n✅ DONE");
    console.log("✔️ Success:", success);
    console.log("❌ Failed:", failed);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

migrateAllInvoices();