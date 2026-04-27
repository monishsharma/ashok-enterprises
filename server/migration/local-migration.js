import "./config/env.js";
import { connectToDB, db } from "./db/connection.js";
import { ObjectId } from "mongodb";
console.log(process.env.MONGO_URI)

const collectionName = "invoices"; // your collection

const migrate = async () => {
     await connectToDB();
 const start = new Date("2026-04-01");
const end = new Date("2027-03-31");

const invoices = await db.collection(collectionName).find({
  invoiceDate: {
    $gte: start,
    $lte: end
  }
}).toArray();

  console.log(`Found ${invoices.length} invoices`);

  for (const invoice of invoices) {
    // 🔁 Skip if transaction already exists (IMPORTANT)
    const company = invoice.company;

    const existingTxn = await db.collection("transactions").findOne({
      referenceId: invoice._id,
      company
    });

    if (existingTxn) {
      console.log(`Skipping invoice ${invoice.invoiceDetail.invoiceNO}`);
      continue;
    }

    // ✅ Ensure ledger
    const customerId = invoice.buyerDetail.customer;
    const name = invoice.buyerDetail.label || invoice.buyerDetail.customerName;
    const groupId = invoice.buyerDetail.groupId || null;

    let ledger = await db.collection("ledger").findOne({ customerId, company });

    if (!ledger) {
      const newLedger = {
        _id: new ObjectId(),
        customerId,
        name,
        company,
        groupId,
        type: "asset",
        createdAt: new Date()
      };

      await db.collection("ledger").insertOne(newLedger);
      ledger = newLedger;
    }

    // ✅ Prepare transaction
    const total = Number(invoice.goodsDescription.Total);
    const taxable = Number(invoice.goodsDescription.taxableValue);
    const cgst = Number(invoice.goodsDescription.CGST || 0);
    const sgst = Number(invoice.goodsDescription.SGST || 0);
    const igst = Number(invoice.goodsDescription.IGST || 0);

    const isInterState = invoice.buyerDetail.isInterState;

    const entries = [
      { ledgerId: ledger._id, type: "debit", amount: total },
      { ledgerName: "Sales", type: "credit", amount: taxable }
    ];

    if (isInterState) {
      if (igst > 0) {
        entries.push({ ledgerName: "IGST Output", type: "credit", amount: igst });
      }
    } else {
      if (cgst > 0) entries.push({ ledgerName: "CGST Output", type: "credit", amount: cgst });
      if (sgst > 0) entries.push({ ledgerName: "SGST Output", type: "credit", amount: sgst });
    }

    // ✅ Insert transaction
    await db.collection("transactions").insertOne({
      _id: new ObjectId(),
      date: new Date(invoice.invoiceDate),
      referenceType: "invoice",
      referenceId: invoice._id,
      company,
      narration: `Invoice ${invoice.invoiceDetail.invoiceNO}`,
      entries,
      createdAt: new Date()
    });

    console.log(`Migrated invoice ${invoice.invoiceDetail.invoiceNO}`);
  }

  console.log("Migration completed ✅");
};

migrate();