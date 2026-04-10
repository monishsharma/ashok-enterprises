import axios from "axios";
import * as cheerio from "cheerio";
import { db } from "../db/connection.js";


const clean = s => s.replace(/^0+/, '') || "0";

const headers = {
  Cookie: 'CKCgPen=DisplayName=ASHOK ENTERPRISES&UserID=0010000943&RoleID=VEND&EmailID=ashok_entp@rediffmail.com&dtFinyear=4/1/2025 12:00:00 AM&FinYear=2025-2026&UserType=N&Division=',
  "User-Agent": "Mozilla/5.0",
};

async function fetchPage(url) {
  const { data } = await axios.get(url, { headers });
  return cheerio.load(data);
}

function extractItems($) {
  const items = [];

  $("#gridContent table tbody tr").each((i, el) => {
    const tds = $(el).find("td").map((i, td) => $(td).text().trim()).get();

    if (tds.length > 5) {
      const qty = parseFloat(tds[7]) || 0;

      items.push({
        itemNo: clean(tds[1]),
        itemCode: clean(tds[2]),
        description: tds[3],
        uom: tds[4],
        drgNo: tds[5]?.split("/")?.[0].trim(),
        totalQty: qty,
        dispatchedQty: qty - parseFloat(tds[8] || 0),
        openQty: parseFloat(tds[8] || 0),
        status: tds[9],
      });
    }
  });

  return items;
}

async function getAllPaginationLinks($, baseUrl) {
  const links = new Set();  // avoid duplicates

  $("tfoot a[data-swhglnk='true']").each((idx, el) => {
    const href = $(el).attr("href");
    if (href && href.includes("page=")) {
      const fullUrl = new URL(href, baseUrl).href;
      links.add(fullUrl);
    }
  });

  return [...links];
}

export const fetchPoDetail = async (detailUrl) => {
  const $ = await fetchPage(detailUrl);

  // Extract page 1 items
  const allItems = [...extractItems($)];

  // Detect pagination URLs
  const pageLinks = await getAllPaginationLinks($, detailUrl);

  // Fetch page 2, 3, ...
  for (const link of pageLinks) {
    const $page = await fetchPage(link);
    const pageItems = extractItems($page);
    allItems.push(...pageItems);
  }

  // Extract header info
  const getLabelValue = (labelText) => {
    const label = $(`label:contains("${labelText}")`);
    return label.parent().contents().last().text().trim();
  };

  const poNumber = getLabelValue("Po Number");
  const poDate = getLabelValue("Po Date");
  const vendor = getLabelValue("Vendor");
  const division = getLabelValue("Divison");
  const paymentTerm = getLabelValue("Payment Term");

  return {
    poNumber,
    poDate,
    vendor,
    division,
    paymentTerm,
    items: allItems,
    createdAt: new Date(),
  };
};


export const detectVendor = ({ poNumber, shippingCity, vendors }) => {

  const cityMatch = vendors.find(v =>
    v.label.toUpperCase().includes(shippingCity)
  );

  return cityMatch;

}


// ===============================
// 🟡 GET UNIQUE PO NUMBERS
// ===============================
export const getPoNumbers = (items) => {
  return [...new Set(items.map(i => i.poNumber))];
};

// ===============================
// 🟡 FETCH POs
// ===============================
export const getPOs = async (poNumbers) => {
  return db.collection("purchaseOrders")
    .find({ poNumber: { $in: poNumbers } })
    .toArray();
};


// ===============================
// 🧩 HELPERS
// ===============================

// Filter items per PO
const filterItemsByPO = (items, poNumber) => items.filter(i => String(i.poNumber) === String(poNumber));

// Find existing invoice
const findExistingInvoice = (po, invoiceId) =>
  (po.dispatchedInvoices || []).find(
    inv => String(inv.invoiceId) === String(invoiceId)
  );

// Revert old dispatch
const revertOldDispatch = (items, oldItems) => {
  const updated = [...items];

  for (const oldItem of oldItems) {
    const index = updated.findIndex(
      i => String(i.itemId) === String(oldItem.itemId)
    );

    if (index === -1) continue;

    const prev = Number(updated[index].dispatchedQty || 0);
    const revert = Number(oldItem.qty || 0);

    updated[index].dispatchedQty = Math.max(prev - revert, 0);
  }

  return updated;
};

// Validate no over-dispatch
const validateDispatch = (items, newItems, po) => {
  for (const newItem of newItems) {
    const item = items.find(
      i => String(i.itemId) === String(newItem.itemId)
    );

    if (!item) continue;

    const available =
      Number(item.qty || 0) -
      Number(item.dispatchedQty || 0);

    if (Number(newItem.qty) > available && po.poType !== "FRAME") {
      throw new Error(
        `Over-dispatch for item ${newItem.itemId}. Available: ${available}, Trying: ${newItem.qty}`
      );
    }
  }
};

// Apply new dispatch
const applyNewDispatch = (items, newItems) => {
  const updated = [...items];

  for (const newItem of newItems) {
    const index = updated.findIndex(
      i => String(i.itemId) === String(newItem.itemId)
    );

    if (index === -1) continue;

    updated[index].dispatchedQty =
      Number(updated[index].dispatchedQty || 0) +
      Number(newItem.qty || 0);
  }

  return updated;
};

// Recalculate pending
const recalculatePending = (items) =>
  items.map(item => ({
    ...item,
    pendingQty: Math.max(
      Number(item.qty || 0) -
      Number(item.dispatchedQty || 0),
      0
    )
  }));

// PO status
const getPOStatus = (items,po) => {
  if (po.poType === "FRAME") {
    const allTouched = items.every(i => i.dispatchedQty > 0);

    return allTouched ? "COMPLETED" : "PENDING";
  } else {
    return items.every(i => i.pendingQty === 0)
    ? "COMPLETED"
    : "PENDING";
  }
}

// Build invoice entry
const buildInvoiceEntry = (invoice, items) => ({
  invoiceId: invoice._id,
  invoiceNo: invoice.invoiceDetail?.invoiceNO,
  invoiceDate: invoice.invoiceDetail?.invoiceDate,
  items: items.map(i => ({
    itemId: i.itemId,
    poNumber: i.poNumber,
    qty: i.qty
  })),
  qtyDispatch: items.reduce(
    (sum, i) => sum + Number(i.qty || 0),
    0
  )
});

// DB update
const updatePOInDB = async ({ poId, items, poStatus, invoiceId, entry }) => {
  await db.collection("purchaseOrders").updateOne(
    { _id: poId },
    {
      $set: {
        items,
        poStatus
      },
      $pull: {
        dispatchedInvoices: { invoiceId }
      }
    }
  );

  await db.collection("purchaseOrders").updateOne(
    { _id: poId },
    {
      $push: {
        dispatchedInvoices: entry
      }
    }
  );
};

// ===============================
// 🔥 MAIN PROCESSOR (PER PO)
// ===============================
export const processPO = async ({ po, invoice, invoiceItems }) => {

  const newItems = filterItemsByPO(invoiceItems, po.poNumber);
  if (!newItems.length) return;

  const existingInvoice = findExistingInvoice(po, invoice._id);
  const oldItems = existingInvoice?.items || [];

  let updatedItems = revertOldDispatch(po.items, oldItems);

  validateDispatch(updatedItems, newItems, po);

  updatedItems = applyNewDispatch(updatedItems, newItems);

  updatedItems = recalculatePending(updatedItems);

  const poStatus = getPOStatus(updatedItems, po);

  const newInvoiceEntry = buildInvoiceEntry(invoice, newItems);
  await updatePOInDB({
    poId: po._id,
    items: updatedItems,
    poStatus,
    invoiceId: invoice._id,
    entry: newInvoiceEntry
  });
};
