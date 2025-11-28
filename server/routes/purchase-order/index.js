import express from "express";
import {getPOQueryLink} from "../../helper/get-query-link.js"
import { fetchPoDetail } from "../../helper/po-detail.js";

const router = express.Router();

router.get("/get/details/:poNumber", async (req, res) => {
  try {
    const poNumber= req.params.poNumber;
    if (!poNumber) return res.status(400).json({ error: "Missing PO number" });

    const detailUrl = await getPOQueryLink(poNumber);
    const poData = await fetchPoDetail(detailUrl);



    res.status(200).json({ message: "PO saved successfully", po: detailUrl, poDetail: poData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;