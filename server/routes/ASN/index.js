import express from "express";
import Axios  from "axios";
import { ObjectId } from "mongodb"
import { fetchItemsForDispatch, generateASN, getAsnDetail, saveASN } from "../../helper/get-asn-detail.js";
import { db } from "../../db/connection.js";

const router = express.Router();

router.get("/get/ASN/detail/:poNumber/:invoiceId", async(req,res) => {

    const poNumber= req.params.poNumber;
    const invoiceId = new ObjectId(req.params.invoiceId);

    try {

        // step 1: get invoice detail
        const invoiceDetail = await db.collection("invoices").findOne({ _id: invoiceId });
        if (!invoiceDetail) {
            return res.status(404).json({ error: "invoice not found" });
        }

        // Step 2: Fetch ASN detail
        let asnDetail;
        try {
            asnDetail = await getAsnDetail({poNumber, invoiceDetail});
        } catch (error) {
            console.error("Error fetching ASN detail:", error.message);
            return res.status(502).json({ success: false, step: "getAsnDetail", error: error.message });
        }

        // check if ASN already generated
        const {invoiceDetail: {invoiceNO}} = invoiceDetail;
        const parts = invoiceNO.split('-'); // splits by '-'
        const lastPart = parts[parts.length - 1];
        const existingASN = asnDetail.asnList.find(a =>
            (a.invoiceNo === invoiceNO || a.invoiceNo === lastPart) && a.asnNumber
        );
        if (existingASN) {
            // Update invoice in DB with this ASN number
            // await db.collection("invoices").updateOne(
            //     { _id: invoiceId },
            //     { $set: {"shippingDetail.asn": existingASN.asnNumber } }
            // );

            // Return response
            return res.json({
                success: true,
                message: "Invoice already has ASN, updated invoice record",
                existingASN: existingASN.asnNumber,
                asnDetail,
                generatedASN: [
                    {
                        "Message": "ASN already exists for this invoice",
                        "ASNID": 1917471,
                        "ASN": existingASN.asnNumber
                    }
                ],
                invoiceUpdated: true
            });
        }

        // Step 3: Save ASN
        let asnSaveResult;
        try {
            asnSaveResult = await saveASN({invoiceDetail, poNumber, asnDetail, finalStep: false});
        } catch (error) {
            console.error("Error saving ASN:", error.message);
            return res.status(502).json({ success: false, step: "saveASN", error: error.message });
        }

        // step 4: fetch items for Dispatch
        let itemsForDispatch;
        const asnNumber = asnSaveResult?.[0]?.ASN;
        try {
            itemsForDispatch = await fetchItemsForDispatch({poNumber, asnNumber, invoiceDetail})
        } catch(error) {
            console.error("Error saving ASN:", error.message);
            return res.status(502).json({ success: false, step: "fetchItemsForDispatch", error: error.message, asnSaveResult });
        }

        // step 5: Generate ASN
        let generatedASN;
        try {
            generatedASN = await generateASN({ invoiceDetail, poNumber })
        } catch(error) {
            console.error("Error Generating ASN:", error.message);
            return res.status(502).json({ success: false, step: "generateASN", error: error.message });
        }


        res.json({
            success: true,
            message: "PO saved successfully",
            asnDetail,
            asnSaveResult,
            itemsForDispatch,
            generatedASN
        });

    } catch (error) {
        console.error("General error:", error);
        res.status(500).json({ success: false, step: "server", error: error.message });
    }
});

export default router;