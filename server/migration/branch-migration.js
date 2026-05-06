import "../config/env.js";
import { connectToDB, db } from "../db/connection.js";

const DRY_RUN = false;

// ✅ get Telawane vendor
function getTelawaneVendor(vendors) {
  return vendors.find(v =>
    v.name.toLowerCase().includes("telawane")
  );
}

// ✅ resolve plant from address
function resolveTelawanePlant(address, vendor) {
  const addr = (address || "").toLowerCase();

  if (addr.includes("ambernath")) {
    return vendor.plantRows.find(p =>
      p.label.toLowerCase().includes("ambernath")
    );
  }

  if (addr.includes("taloja")) {
    return vendor.plantRows.find(p =>
      p.label.toLowerCase().includes("taloja")
    );
  }

  if (addr.includes("rabale")) {
    return vendor.plantRows.find(p =>
      p.label.toLowerCase().includes("rabale")
    );
  }

  return null;
}

async function fixOnlyTelawane() {
  try {
    await connectToDB();

    const vendors = await db.collection("customers").find({}).toArray();
    const telawane = getTelawaneVendor(vendors);

    if (!telawane) {
      console.log("❌ Telawane vendor not found");
      process.exit(1);
    }

    // 🔥 ONLY Telawane invoices
    const invoices = await db.collection("invoices").find({
      company: "PADMA",
      "buyerDetail.GSTIN": "27AACCT0358D1ZM"
    }).toArray();

    console.log(`📦 Telawane invoices: ${invoices.length}`);

    let success = 0;
    let failed = 0;

    for (const invoice of invoices) {
      const invoiceNo = invoice?.invoiceDetail?.invoiceNO;
      const address = invoice?.buyerDetail?.address;

      const plant = resolveTelawanePlant(address, telawane);

      if (!plant) {
        console.log(`❌ FAILED: ${invoiceNo}`, { address });
        failed++;
        continue;
      }

      console.log(`✅ MATCH: ${invoiceNo}`, {
        plant: plant.label,
        branchId: plant.id,
        name: plant.label
      });

        await db.collection("invoices").updateOne(
          { _id: invoice._id },
          {
            $set: {
              "buyerDetail.customer": telawane._id,
              "buyerDetail.branch": plant.id,
              "buyerDetail.customerName": plant.label
            }
          }
        );

      success++;
    }

    console.log("\n📊 RESULT");
    console.log("✔️ Success:", success);
    console.log("❌ Failed:", failed);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

fixOnlyTelawane();