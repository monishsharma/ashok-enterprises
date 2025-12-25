import express from "express";
import { ObjectId } from "mongodb";
import { db } from "../../db/connection.js";
const router = express.Router();

let isProduction = process.env.NODE_ENV === "prod";
// const collectionName = isProduction ? "invoices" : "invoices";
// const quotationCollection = isProduction ? "invoices" : "invoicesCopy";
// const configCollection = isProduction ? "invoices" : "invoicesCopy";

router.post('/save-quotation', async(req,res) => {
    const data = req.body;
    const company = data.quotationDetail.quotationCompany;
    data._id = new ObjectId();
    data.quotationDate = new Date(data.quotationDetail.quotationDate);
    data.company = company;

    try {
        const collection = db.collection("quotation");
        await collection.insertOne(data);
        const [prefix, year, number] = data.quotationDetail.quotationNo.split("-");
        const nextNumber = (parseInt(number, 10) + 1).toString().padStart(2, "0");

        await db.collection("billing").updateOne(
        {}, // assuming only one document
        {
            $set: {
            [`quotation.${company}.lastQuotationNo`]: number,
            [`quotation.${company}.nextQuotationNo`]: nextNumber,
            },
        }
        );
        res.status(200).send({ message: "Quotation saved successfully" });
    } catch (error) {
        res.status(500).send({ message: "Error saving quotation", error });
    }
});

export default router;