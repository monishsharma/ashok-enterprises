import express from "express";
import Axios  from "axios";
import { ObjectId } from "mongodb"
import { fetchItemsForDispatch, generateASN, getAsnDetail, getAsnNumber, saveASN } from "../../helper/get-asn-detail.js";
import { db } from "../../db/connection.js";

const router = express.Router();

router.post("/check/ASN/generation/:poNumber", async(req,res) => {

    const poNumber= req.params.poNumber;
    const invoiceDetail = req.body;

    const {invoiceDetail: {invoiceNO}} = invoiceDetail;
    const parts = invoiceNO.split('-'); // splits by '-'
    const lastPart = parts[parts.length - 1];
    let asnNumber = "";
    try {
        const asnDetail = await getAsnDetail({poNumber, invoiceDetail});
        // if  po is blocked //
        if (asnDetail.isBlocked) {
            return res.status(500).json({ success: false, error: "PO is Blocked." });
        }


        const {asnList = []} = asnDetail;
        const existingASN = asnList.find(asn => [lastPart, invoiceNO].includes(asn.invoiceNo));

        if (existingASN === undefined) {
            return res.status(200).json({
                success: true,
                asnDetail,
                asnNumber: "0",
                invoiceNO,
                status: "Not Generated",
                fromEditLink: false
            })
        }

        if (existingASN && existingASN.asnNumber) {
            return res.json({ success: true, asnDetail, asnNumber: existingASN.asnNumber, invoiceNO, status: existingASN.status, fromEditLink: false });
        };
        if (existingASN && existingASN.editLink) {
            asnNumber = await getAsnNumber(existingASN.editLink);
            if (asnNumber) {
                return res.json({ success: true, asnDetail, asnNumber, invoiceNO, status: existingASN.status, fromEditLink: true });
            } else {
                res.status(502).json({ success: false, step: "getAsnDetail", error: error.message });
            }
        }

    } catch (error) {
        console.error("Error fetching ASN detail:", error.message);
        res.status(502).json({ success: false, step: "getAsnDetail", error: error.message });
    };


});

router.post("/get/ASN/detail/:poNumber", async(req,res) => {

    const poNumber= req.params.poNumber;
    const {payload, invoiceDetail} = req.body;

    try {


        // Step 1: Save ASN
        let asnSaveResult;
        try {
            asnSaveResult = await saveASN({ payload });
        } catch (error) {
            console.error("Error saving ASN:", error.message);
            return res.status(502).json({ success: false, step: "saveASN", error: error.message });
        }

        // step 2: fetch items for Dispatch
        let itemsForDispatch;
        const asnNumber = asnSaveResult?.[0]?.ASN;
        try {
            itemsForDispatch = await fetchItemsForDispatch({poNumber, asnNumber, invoiceDetail})
        } catch(error) {
            console.error("Error saving ASN:", error.message);
            return res.status(502).json({ success: false, step: "fetchItemsForDispatch", error: error.message, asnSaveResult });
        }

        // step 3: Generate ASN
        let generatedASN;
        const updatedPayload = JSON.parse(JSON.stringify(payload));
        if (asnSaveResult?.[0]?.ASN) {
            updatedPayload.items.ASN = asnSaveResult[0].ASN;
        }
        updatedPayload.items.vStatus = "CA";
        try {
            generatedASN = await generateASN({ payload: updatedPayload })
        } catch(error) {
            console.error("Error Generating ASN:", error.message);
            return res.status(502).json({ success: false, step: "generateASN", error: error.message });
        }


        res.json({
            success: true,
            message: "PO saved successfully",
            asnSaveResult,
            itemsForDispatch,
            generatedASN: generatedASN
        });

    } catch (error) {
        console.error("General error:", error);
        res.status(500).json({ success: false, step: "server", error: error.message });
    }
});

export default router;