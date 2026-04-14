import { ObjectId } from "mongodb";
import { db } from "../../../db/connection.js";

export const checkExistingInvoice = async ({ invoiceData, collectionName }) => {
    const existing = await db.collection(collectionName).findOne({
        "invoiceDetail.invoiceNO": invoiceData.invoiceDetail.invoiceNO,
        company: invoiceData.company,
    });
    return existing;
}

export const updateInvoiceNumber = async ({ invoiceData }) => {
    const [prefix, year, number] = invoiceData.invoiceDetail.invoiceNO.split("-"); // AE-25-26-02
    const nextNumber = (parseInt(number, 10) + 1).toString().padStart(2, "0");

    await db.collection("billing").updateOne(
        {}, // assuming only one document
        {
            $set: {
                [`${invoiceData.company}.lastInvoiceNo`]: number,
                [`${invoiceData.company}.nextInvoiceNo`]: nextNumber,
            },
        },
    );
}

export const createLedger = async ({ invoiceData }) => {

    const company = invoiceData.company;
    const customerId = invoiceData.buyerDetail.customer;
    const name = invoiceData.buyerDetail.label || invoiceData.buyerDetail.customerName;
    const groupId = invoiceData.buyerDetail.groupId || null;

    let ledger = await db.collection("ledger").findOne({ customerId });

    if (!ledger) {
        const newLedger = {
            _id: new ObjectId(),
            customerId,
            name,
            groupId,
            company,
            type: "asset",
            createdAt: new Date()
        };

        await db.collection("ledger").insertOne(newLedger);
        return newLedger; // ✅ return
    }
    return ledger;

}

export const createTransaction = async ({ invoiceData, ledgerId }) => {

    const company = invoiceData.company;
    const isInterState = invoiceData.buyerDetail.isInterState;
    const total = Number(invoiceData.goodsDescription.Total);
    const taxable = Number(invoiceData.goodsDescription.taxableValue);
    const CGST = Number(invoiceData.goodsDescription.CGST || 0);
    const SGST = Number(invoiceData.goodsDescription.SGST || 0);

    const entries = [
        {
            ledgerId: ledgerId,
            type: "debit",
            amount: total
        },
        {
            ledgerName: "Sales",
            type: "credit",
            amount: taxable
        }
    ];

    // GST LOGIC
    if (isInterState) {
        entries.push({
            ledgerName: "IGST Output",
            type: "credit",
            amount: Number(SGST) + Number(CGST)
        });
    } else {
        if (CGST > 0) {
            entries.push({
                ledgerName: "CGST Output",
                type: "credit",
                amount: CGST
            });
        }
        if (SGST > 0) {
            entries.push({
                ledgerName: "SGST Output",
                type: "credit",
                amount: SGST
            });
        }
    }
    await db.collection("transactions").insertOne({
        _id: new ObjectId(),
        date: invoiceData.invoiceDate,
        referenceType: "invoice",
        referenceId: invoiceData._id,
        narration: `Invoice ${invoiceData.invoiceDetail.invoiceNO}`,
        entries,
        company,
        createdAt: new Date()
    });

}