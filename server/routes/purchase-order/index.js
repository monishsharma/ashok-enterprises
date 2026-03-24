import express from "express";
import { ObjectId } from "mongodb";
import {getPOQueryLink} from "../../helper/get-query-link.js"
import { detectVendor, fetchPoDetail, getPoNumbers, getPOs, processPO } from "../../helper/po-detail.js";
import { db } from "../../db/connection.js";
import { calculateDispatch } from "../../helper/calculate-dispatched-items.js";

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

router.get("/get-po-list", async (req, res) => {
  try {

    let filters = { ...req.query };

    if (filters.vendorId) {
      filters.vendorId = new ObjectId(filters.vendorId);
    }

    if (filters.poType === "OTHERS") {
      filters.poType = { $nin: ["FRAME", "ROLLER", "BAKELITE"] };
    }

    const purchaseOrderCollection = await db
      .collection("purchaseOrders")
      .find(filters)
      .toArray();

    res.status(200).json({
      message: "PO fetched successfully",
      data: purchaseOrderCollection
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching PO",
      error
    });
  }
});

router.get("/get-po-detail-by-id/:id", async(req, res) => {
  try {

    const poId = new ObjectId(req.params.id);
    if (!poId) return res.status(400).json({ error: "Missing poId Name" });
    const poDetail = await db.collection("purchaseOrders").findOne({ _id: poId });
     if (!poDetail) {
      return res.status(404).json({ error: "po not found" });
    }

    res.status(200).json({
      message: "PO detail fetch successfully",
      data: poDetail
    });

  } catch(error) {
    console.log(error)
    res.status(500).json({
      message: "PO not found",
      error
    });
  }
})

router.post("/post-po-detail", async (req, res) => {
  try {

    const poData = req.body;
    const { company, poNumber, items, shippingCity } = poData;

    const vendorsCollection = await db.collection("vendors").findOne({});
    const vendorPO = detectVendor({poNumber, shippingCity, vendors: vendorsCollection.vendors});
    let samePOInvoices = await db.collection("invoices")
      .find({
        company,
        "goodsDescription.po": { $in: [poNumber] }
      }).toArray();


    // calculate dispatch
    const dispatchDetails = calculateDispatch({
      invoices: samePOInvoices,
      poItems: items,
      company
    });

    poData.items = dispatchDetails;
    poData.vendorId = vendorPO?.id || "";
    poData.poStatus = "PENDING"

    // store invoice summary
    poData.dispatchedInvoices = samePOInvoices.map(inv => ({
      invoiceId: inv._id,
      invoiceNo: inv.invoiceDetail?.invoiceNO,
      invoiceDate: inv.invoiceDetail?.invoiceDate,
      items: inv.goodsDescription?.items,
      qtyDispatch: (inv.goodsDescription?.items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0)
    }));
// await db.collection("purchaseOrders").dropIndex("company_1_poDisplay_1");
// const indexes = await db.collection("purchaseOrders").indexes();

    // save PO
    await db.collection("purchaseOrders").insertOne(poData);

    res.json({
      message: "PO processed successfully",
      data: poData
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(500).json({
        message: "PO already exists",
        error,
      })
    }
     console.error(error);

    res.status(500).json({
      message: "Error saving PO",
      error
    });

  }
});

router.patch("/update-po-on-invoice", async (req, res) => {
  try {
    const invoice = req.body;
    const invoiceItems = invoice.goodsDescription?.items || [];

    if (!invoiceItems.length) {
      return res.json({ message: "No items in invoice" });
    }

    // ✅ derive PO numbers
    const poNumbers = getPoNumbers(invoiceItems);

    // ✅ fetch POs
    const pos = await getPOs(poNumbers);

    // ✅ process each PO
    for (const po of pos) {
      await processPO({ po, invoice, invoiceItems });
    }

    res.json({ message: "PO updated successfully" });

  } catch (error) {
    console.error("PO UPDATE ERROR:", error);

    res.status(500).json({
      message: error.message || "Error updating PO"
    });
  }
});


export default router;