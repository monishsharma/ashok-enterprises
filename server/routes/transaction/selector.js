// import { db } from "../../db/connection";

// export const createPayment = async ({ company, ledgerId, amount, date }) => {

//     const cashLedger = await db.collection("ledger").findOne({
//         name: "Cash",
//         company
//     });

//     if (!cashLedger) {
//         throw new Error("Cash ledger not found");
//     }

//     const entries = [
//         {
//             ledgerId: cashLedger._id,
//             type: "debit",
//             amount
//         },
//         {
//             ledgerId: ledgerId, // customer
//             type: "credit",
//             amount
//         }
//     ];

//     await db.collection("transactions").insertOne({
//         date: new Date(date),
//         referenceType: "payment",
//         narration: "Customer Payment",
//         entries,
//         company,
//         createdAt: new Date()
//     });
// };