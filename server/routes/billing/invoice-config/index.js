import express from "express";
import InvoiceConfig from "./schema.js";
import { db } from "../../../db/connection.js";
import ejs from "ejs";
import path from "path";
// import puppeteer from 'puppeteer';
import { fileURLToPath } from "url";
import { ObjectId } from "mongodb";
const router = express.Router();
import { ToWords } from "to-words";
import fs from "fs";
import { format } from "@fast-csv/format";
import xlsx from "xlsx";
import crypto from "crypto";
import {
  getCsvBody,
  getCSVHeader,
  getFileName,
} from "../../../helper/csv-helper.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Puppeteer config
let browser;
let isProduction = process.env.NODE_ENV === "prod";
const collectionName = isProduction ? "invoices" : "invoicesCopy";
// const collectionName = isProduction ? "invoices" : "invoicesCopy";

async function getBrowser() {
  if (browser) return browser;

  if (isProduction) {
    const puppeteer = (await import("puppeteer-core")).default;
    const chromium = (await import("@sparticuz/chromium")).default;

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    const puppeteer = (await import("puppeteer")).default;
    browser = await puppeteer.launch();
  }

  return browser;
}

const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
  },
});

const convertAmountToWords = (amount) => {
  return toWords.convert(parseFloat(amount));
};

router.get("/get-invoice-config", async (req, res) => {
  try {
    const billingCollection = db.collection("billing");
    const config = await billingCollection.findOne({});

    if (!config) {
      return res.status(404).json({ error: "Config not found" });
    }

    res.status(200).json(config);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/vendor/list", async (req, res) => {
  try {
    const vendorCollection = db.collection("vendors");
    const vendorList = await vendorCollection.findOne({});
    if (!vendorList) {
      return res.status(404).json({ error: "vendor not found" });
    }

    res.status(200).json(vendorList);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/get/invoice/report/:company", async (req, res) => {
  const company = req.params.company;
  let query = { company: company };
  const { month, year, type } = req.query;

  try {
    const invoiceCollection = db.collection(collectionName);

    let currentMonthInvoices = [];
    let prevMonthInvoices = [];
    let totalCount = 0;
    let preInvoiceCount = 0;
    let invoiceAmount = [];
    let unpaidInvoices = [];

    if (month && year) {
      // Parse input as integers
      const currentMonth = parseInt(month); // 1–12
      const currentYear = parseInt(year);

      // Current month date range
      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 1);

      // Previous month date range
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      const prevStartDate = new Date(prevYear, prevMonth - 1, 1);
      const prevEndDate = new Date(prevYear, prevMonth, 1);

      // Fetch current month invoices
      const currentQuery = {
        ...query,
        invoiceDate: { $gte: startDate, $lt: endDate },
      };
      currentMonthInvoices = await invoiceCollection
        .find(currentQuery)
        .sort({ "invoiceDetail.invoiceNO": -1 })
        .toArray();
      totalCount = await invoiceCollection.countDocuments(currentQuery);
      // Fetch previous month invoices
      const prevQuery = {
        ...query,
        invoiceDate: { $gte: prevStartDate, $lt: prevEndDate },
      };
      prevMonthInvoices = await invoiceCollection
        .find(prevQuery)
        .sort({ "invoiceDetail.invoiceNO": -1 })
        .toArray();
      preInvoiceCount = await invoiceCollection.countDocuments(prevQuery);
    }

    // Helper to calculate totals
    const calculateTotals = (invoices) => {
      let total = 0,
        paid = 0,
        unpaid = 0,
        due = 0;
      invoices.forEach((inv) => {
        const amount = parseFloat(inv.goodsDescription.Total);
        invoiceAmount.push(amount);
        total += amount;
        if (inv.paid) {
          paid += inv.paymentAmount || 0;
          due += inv.duePayment || 0;
        } else unpaid += amount;
      });
      return { total, paid, unpaid, due };
    };

    const current = calculateTotals(currentMonthInvoices);
    const previous = calculateTotals(prevMonthInvoices);

    // Calculate percentage and growth flag for invoice amount
    let invoiceAmountChange = 0;
    let invoiceAmountGrowth = false;
    if (previous.total > 0) {
      invoiceAmountChange =
        ((current.total - previous.total) / previous.total) * 100;
      invoiceAmountChange = parseFloat(invoiceAmountChange.toFixed(2));
      invoiceAmountGrowth = current.total > previous.total;
    } else if (current.total > 0) {
      invoiceAmountChange = 100;
      invoiceAmountGrowth = true;
    }

    // Calculate percentage and growth flag for total invoice count
    let invoiceCountChange = 0;
    let invoiceCountGrowth = false;
    if (preInvoiceCount > 0) {
      invoiceCountChange =
        ((totalCount - preInvoiceCount) / preInvoiceCount) * 100;
      invoiceCountChange = parseFloat(invoiceCountChange.toFixed(2));
      invoiceCountGrowth = totalCount > preInvoiceCount;
    } else if (totalCount > 0) {
      invoiceCountChange = 100;
      invoiceCountGrowth = true;
    }
    // Monthly invoice totals from April (index 0) to March (index 11)
    const monthlyTotals = Array(12).fill(0);

    if (year) {
      const selectedYear = parseInt(year);

      // Financial year starts in April of current year and ends in March of next year
      const fyStart = new Date(selectedYear, 3, 1); // April 1
      const fyEnd = new Date(selectedYear + 1, 3, 1); // April 1 next year

      const fyInvoices = await invoiceCollection
        .find({
          ...query,
          invoiceDate: { $gte: fyStart, $lt: fyEnd },
        })
        .toArray();

      fyInvoices.forEach((inv) => {
        const amount = parseFloat(inv.goodsDescription.Total || 0);
        const actualMonth = new Date(inv.invoiceDate).getMonth(); // 0–11

        // Reindex month to start from April as 0, May as 1, ..., March as 11
        const fiscalMonthIndex = (actualMonth + 9) % 12;
        monthlyTotals[fiscalMonthIndex] += amount;
      });
    }

    // Collect yearly totals (for multiple years)
    const yearlyTotals = {};

    // Fetch all invoices of this company
    const allInvoices = await invoiceCollection.find(query).toArray();

    allInvoices.forEach((inv) => {
      const amount = parseFloat(inv.goodsDescription.Total || 0);
      const d = new Date(inv.invoiceDate);

      // Financial year calculation (April = start)
      const fyYear = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
      const fyLabel = `${fyYear}-${fyYear + 1}`;

      if (!yearlyTotals[fyLabel]) yearlyTotals[fyLabel] = 0;
      yearlyTotals[fyLabel] += amount;
    });

    // yearlyTotals = { "2022-2023": 12345, "2023-2024": 67890, ... }

    const customerTotals = {};
    const ashokSalesType = {};

    currentMonthInvoices.forEach((invoice) => {
      const customer = invoice.buyerDetail.customer || "Unknown";
      const amount = parseFloat(invoice.goodsDescription.Total || 0);
      const type = invoice.buyerDetail.orderType || "";

      if (!customerTotals[customer]) {
        customerTotals[customer] = {
          total: 0,
          paid: 0,
          unpaid: 0,
        };
      }

      if (!ashokSalesType[type]) {
        ashokSalesType[type] = {
          total: 0,
        };
      }

      ashokSalesType[type].total += amount;

      customerTotals[customer].total += amount;
      if (invoice.paid) {
        customerTotals[customer].paid += amount;
      } else {
        customerTotals[customer].unpaid += amount;
      }
    });

    res.status(200).json({
      totalItems: totalCount,
      totalInvoiceAmount: current.total,
      paidTotal: current.paid,
      unpaidTotal: current.unpaid,
      dueTotal: current.due,
      monthlyTotals,
      ashokSalesType,
      yearlyTotals,
      invoiceAmountChange: {
        percentage: invoiceAmountChange,
        growth: invoiceAmountGrowth,
      },
      invoiceCountChange: {
        percentage: invoiceCountChange,
        growth: invoiceCountGrowth,
      },
      customerTotals,
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/invoice/list/unpaid", async (req, res) => {
  const { month, year, company } = req.query;
  let unpaidInvoices = [];
  if (!month || !year) {
    return res.status(400).json({ error: "Month and year are required." });
  }

  try {
    const invoiceCollection = db.collection(collectionName);
    if (month && year) {
      // Parse input as integers
      const currentMonth = parseInt(month); // 1–12
      const currentYear = parseInt(year);

      // Current month date range
      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 1);

      const currentQuery = {
        company, // or any specific company
        invoiceDate: { $gte: startDate, $lt: endDate },
      };
      // Fetch previous month invoices

      unpaidInvoices = await invoiceCollection
        .find({ ...currentQuery, paid: false })
        .toArray();
      res.status(200).json(unpaidInvoices);
    }
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/invoice/list/:company", async (req, res) => {
  const company = req.params.company;
  const page = parseInt(req.query.page) || 1; // default to page 1
  const limit = parseInt(req.query.limit) || 10; // default to 10 items per page
  const skip = (page - 1) * limit;
  const { month, year } = req.query;
  let query = { company: company };
  // If month and year are provided, add date filtering
  if (month && year) {
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    query.invoiceDate = { $gte: startDate, $lt: endDate };
  }
  try {
    const invoiceCollection = db.collection(collectionName);

    const totalCount = await invoiceCollection.countDocuments(query);
    const invoiceList = await invoiceCollection
      .find(query)
      // .sort({ "invoiceDetail.invoiceNO": -1 })
      // .skip(skip)
      // .limit(limit)
      .toArray();
    if (!invoiceList || invoiceList.length === 0) {
      return res.status(404).json({ error: "No invoices found" });
    }

    const sortedInvoices = invoiceList.sort((a, b) => {
      const aNum = parseInt(a.invoiceDetail.invoiceNO.split("-").pop()) || 0;
      const bNum = parseInt(b.invoiceDetail.invoiceNO.split("-").pop()) || 0;
      return bNum - aNum; // descending order
    });

    // const billDates = [...new Set(invoiceList.map(inv => {
    //   const date = new Date(inv.invoiceDate);
    //   return date.toISOString().split('T')[0];
    // }))];

    const paginatedInvoices = sortedInvoices;
    // const paginatedInvoices = sortedInvoices.slice(skip, skip + limit);

    res.status(200).json({
      data: paginatedInvoices,
      currentPage: page,
      // billDates,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/invoice/:id", async (req, res) => {
  const id = new ObjectId(req.params.id);
  try {
    const invoiceCollection = await db
      .collection(collectionName)
      .findOne({ _id: id });
    if (!invoiceCollection) {
      return res.status(404).json({ error: "invoice not found" });
    }

    res.status(200).json(invoiceCollection);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/vendor/:id", async (req, res) => {
  const vendorId = new ObjectId(req.params.id); // assuming id is ObjectId

  try {
    const result = await db.collection("vendors").findOne(
      { "vendors.id": vendorId }, // this assumes vendors.id is an ObjectId
      { projection: { "vendors.$": 1 } }
    );

    res.json(result);
  } catch (err) {
    console.error("Error fetching vendor:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/update/vendor/list", async (req, res) => {
  const payload = req.body.map((v) => {
    v.id = new ObjectId(v.id);
    return v;
  });

  try {
    const vendorCollection = db.collection("vendors");
    const result = await vendorCollection.updateOne(
      {},
      { $set: { vendors: payload } },
      { upsert: true }
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/invoice", async (req, res) => {
  const data = req.body;
  const company = data.invoiceDetail.company || "ASHOK";

  try {
    // Check for duplicate invoice number
    const existing = await db.collection(collectionName).findOne({
      "invoiceDetail.invoiceNO": data.invoiceDetail.invoiceNO,
      company: company,
    });

    if (existing) {
      return res.status(400).json({
        error: "Invoice number already exists.",
      });
    }

    // Add metadata
    data._id = new ObjectId();
    data.company = company;
    data.invoiceDate = new Date(data.invoiceDetail.invoiceDate);

    await db.collection(collectionName).insertOne(data);

    const [prefix, year, number] = data.invoiceDetail.invoiceNO.split("-"); // AE-25-26-02
    const nextNumber = (parseInt(number, 10) + 1).toString().padStart(2, "0");

    await db.collection("billing").updateOne(
      {}, // assuming only one document
      {
        $set: {
          [`${company}.lastInvoiceNo`]: number,
          [`${company}.nextInvoiceNo`]: nextNumber,
        },
      }
    );

    res.status(201).json({ message: "Invoice saved", id: data._id });
  } catch (error) {
    console.error("Error saving invoice:", error);
    res.status(500).send("Internal server error");
  }
});




/**
 * Convert an object into dot-notated keys for $set.
 * Example: { a: { b: 1 }, c: 2 } -> { "a.b": 1, "c": 2 }
 * Arrays are set as whole values (not expanded).
 */
function buildDotSet(obj, prefix = "") {
  const out = {};
  for (const key of Object.keys(obj || {})) {
    const val = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;

    // If val is a plain object (not array, not date, not null), recurse
    if (
      val &&
      typeof val === "object" &&
      !Array.isArray(val) &&
      !(val instanceof Date)
    ) {
      const nested = buildDotSet(val, path);
      Object.assign(out, nested);
    } else {
      out[path] = val;
    }
  }
  return out;
}

router.patch("/update/invoice/:id", async (req, res) => {
  if (!req.params.id || !ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid invoice id" });
  }
  const id = new ObjectId(req.params.id);
  const payload = req.body || {};
  if (payload._id) delete payload._id;
  // keep invoiceDate if you need it on invoice doc (optional)
  if (payload.invoiceDetail && payload.invoiceDetail.invoiceDate) {
    payload.invoiceDate = new Date(payload.invoiceDetail.invoiceDate);
  }

  const invoicesCol = db.collection(collectionName);
  const paymentCol = db.collection("payment");

  try {
    // fetch existing invoice
    const existing = await invoicesCol.findOne({ _id: id });
    if (!existing) return res.status(404).json({ error: "Invoice not found" });

    // minimal merge: set only provided top-level keys (prevents wiping nested objects)
    const setDoc = {};
    for (const k of Object.keys(payload || {})) {
      if (k === "_id") continue;
      setDoc[k] = payload[k];
    }
    if (Object.keys(setDoc).length > 0) {
      await invoicesCol.updateOne({ _id: id }, { $set: setDoc });
    }

    // get reference number (prefer payload, fallback to existing)
    const refNo = String(
      (payload.invoiceDetail && payload.invoiceDetail.invoiceNO) ||
        (existing.invoiceDetail && existing.invoiceDetail.invoiceNO) ||
        ""
    );

    if (!refNo) {
      const updatedInvoice = await invoicesCol.findOne({ _id: id });
      return res.status(200).json({ message: "Invoice saved (no refNo)", invoice: updatedInvoice });
    }

    // ---- IMPORTANT: use UTC-midnight for day buckets to avoid timezone drift ----
    const now = new Date();
    const dayStartUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const nextDayUtc = new Date(dayStartUtc);
    nextDayUtc.setUTCDate(dayStartUtc.getUTCDate() + 1);
    const dayStartUtcTs = dayStartUtc.getTime();

    const paymentAmount = Number(payload?.paymentAmount ?? existing?.paymentAmount ?? 0);
    const invoiceAmountRaw =
      payload?.goodsDescription?.Total ??
      payload?.goodsDescription?.total ??
      existing?.goodsDescription?.Total ??
      existing?.goodsDescription?.total ??
      0;
    const invoiceAmount = Number(invoiceAmountRaw || 0);

    const newUpdateObj = {
      referenceNumber: refNo,
      paidAmount: Number.isFinite(paymentAmount) ? paymentAmount : 0,
      invoiceAmount: Number.isFinite(invoiceAmount) ? invoiceAmount : 0,
      bulkUpload: false,
      source: "individual",
      updatedAt: new Date(),
    };

    // Determine paid flag from payload or existing invoice
    const paidFlag = typeof payload.paid !== "undefined" ? Boolean(payload.paid) : Boolean(existing.paid);

    if (paidFlag) {
      // SELECTIVE CLEANUP: remove previous individual entries from other UTC-day docs (keep bulk)
      const docsWithIndividual = await paymentCol.find({
        "updates.referenceNumber": refNo,
        "updates.bulkUpload": { $in: [false, null] },
      }).toArray();

      for (const doc of docsWithIndividual) {
        const docDate = doc.date ? new Date(doc.date) : null;
        const docDayStartUtcTs = docDate
          ? Date.UTC(docDate.getUTCFullYear(), docDate.getUTCMonth(), docDate.getUTCDate())
          : null;

        // remove only if it's not the same UTC day as today
        if (docDayStartUtcTs !== null && docDayStartUtcTs !== dayStartUtcTs) {
          await paymentCol.updateOne(
            { _id: doc._id },
            { $pull: { updates: { referenceNumber: refNo, bulkUpload: false } } }
          );

          // delete the doc if updates array became empty
          const refreshed = await paymentCol.findOne({ _id: doc._id });
          if (!refreshed || !Array.isArray(refreshed.updates) || refreshed.updates.length === 0) {
            await paymentCol.deleteOne({ _id: doc._id });
          }
        }
      }

      // FIND existing payment doc for the SAME UTC DAY using range
      const todayDoc = await paymentCol.findOne({ date: { $gte: dayStartUtc, $lt: nextDayUtc } });

      if (!todayDoc) {
        // create today's UTC-bucket and push the update (date set to UTC-midnight)
        await paymentCol.updateOne(
          { date: dayStartUtc },
          {
            $setOnInsert: { date: dayStartUtc, createdAt: new Date(), bulkUpload: false },
            $push: { updates: newUpdateObj },
          },
          { upsert: true }
        );
      } else {
        // push/update inside the found doc (safe: won't change doc.date)
        const existingEntry = (todayDoc.updates || []).find(u => String(u.referenceNumber) === refNo);

        if (!existingEntry) {
          await paymentCol.updateOne({ _id: todayDoc._id }, { $push: { updates: newUpdateObj } });
        } else {
          const amountsDiffer =
            Number(existingEntry.paidAmount || 0) !== Number(newUpdateObj.paidAmount || 0) ||
            String(existingEntry.invoiceAmount || "") !== String(newUpdateObj.invoiceAmount || "");

          if (existingEntry.bulkUpload && amountsDiffer) {
            // preserve bulk entry and append individual correction
            await paymentCol.updateOne({ _id: todayDoc._id }, { $push: { updates: newUpdateObj } });
          } else {
            const identical =
              !amountsDiffer && Boolean(existingEntry.bulkUpload) === Boolean(newUpdateObj.bulkUpload);

            if (!identical) {
              await paymentCol.updateOne(
                { _id: todayDoc._id, "updates.referenceNumber": refNo },
                {
                  $set: {
                    "updates.$[u].paidAmount": newUpdateObj.paidAmount,
                    "updates.$[u].invoiceAmount": newUpdateObj.invoiceAmount,
                    "updates.$[u].bulkUpload": newUpdateObj.bulkUpload,
                    "updates.$[u].updatedAt": newUpdateObj.updatedAt,
                    "updates.$[u].source": newUpdateObj.source,
                  },
                },
                { arrayFilters: [{ "u.referenceNumber": refNo }] }
              );
            }
            // else identical -> nothing to do
          }
        }
      }
    } else {
      // UNPAID branch: operate only on today's UTC-day doc (range)
      const todayDoc = await paymentCol.findOne({ date: { $gte: dayStartUtc, $lt: nextDayUtc } });
      if (todayDoc) {
        const updates = Array.isArray(todayDoc.updates) ? todayDoc.updates : [];
        if (updates.length === 1 && String(updates[0].referenceNumber) === refNo) {
          await paymentCol.deleteOne({ _id: todayDoc._id });
        } else {
          await paymentCol.updateOne({ _id: todayDoc._id }, { $pull: { updates: { referenceNumber: refNo } } });
        }
      }
    }

    const updatedInvoice = await invoicesCol.findOne({ _id: id });
    return res.status(200).json({ message: "Invoice saved", invoice: updatedInvoice });
  } catch (err) {
    console.error("❌ Server Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});







router.get("/generate-pdf/:id/:downloadOriginal", async (req, res) => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  const { id } = req.params;

  try {
    const data = await db
      .collection(collectionName)
      .findOne({ _id: new ObjectId(id) });
    if (!data) return res.status(404).send("Invoice not found");
    const img = data.company === "ASHOK" ? "ashoklogo.png" : "padma.png";
    const bankDetail =
      data.company === "PADMA"
        ? `
        <ul style="margin: 0; text-align: left; padding-left: 20px; list-style-type: decimal; line-height: 1.5;">
        <li>HDFC Bank (Kanti Nagar Gwalior, MP, 474002)<br />A/C NO: 50200047766504 <br/> IFSC CODE: HDFC0009437</li>
        <li>Goods once sold will not be back</li>
        <li>Subject to Gwalior jurisdiction only</li>
        </ul>`
        : `
        <ul style="margin: 0; text-align: left; padding-left: 20px; list-style-type: decimal; line-height: 1.5;">
        <li>STATE BANK OF INDIA (SME BRANCH PATANKAR BAZAR LASHKAR)<br />A/C NO: 63008044566 <br/> IFSC CODE: SBIN0030119</li>
        <li>Goods once sold will not be back</li>
        <li>Subject to Gwalior jurisdiction only</li>
        </ul>`;

    const logoPath = path.join(__dirname, img);
    const imageBuffer = fs.readFileSync(logoPath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = "image/png"; // or jpg if it's jpeg
    const logoDataURI = `data:${mimeType};base64,${base64Image}`;
    const amountInWords = `Indian Rupees  ${convertAmountToWords(
      data.goodsDescription.Total
    )}`;
    const date = new Date(data.invoiceDetail.invoiceDate);
    const formattedDate = `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
    const returnHeight = () => {
      if (data.company === "ASHOK") {
        if (req.params.downloadOriginal) return "190px";
        return "250px";
      }
      return "230px";
    };
    const html = await ejs.renderFile(
      path.join(__dirname, "./templates/invoice.ejs"),
      {
        data,
        formattedDate,
        amountInWords,
        logoBase64: logoDataURI,
        bankDetail,
        showLogo: req.params.downloadOriginal === "true",
        height: returnHeight(),
        isUniqueVendor: data.buyerDetail.customer == "Rajasthan Explosives",
      }
    );

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "LEGAL",
      margin: {
        top: req.params.downloadOriginal ? "6px" : "15px",
        bottom: 0,
        left: "10px",
        right: "10px",
      },
      printBackground: true,
      scale: 0.9,
    });

    await page.close(); // don't close browser, just the page
    const sanitizeFilename = (name) => name.replace(/[\/\\:*?"<>|]/g, "-");
    const invoiceNo = data.invoiceDetail.invoiceNO || "invoice";
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${sanitizeFilename(
        invoiceNo
      )}.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/generate-csv", async (req, res) => {
  const { month, year, company, GST, forUnpaid: unpaid } = req.query;
  const forGST = GST === "true";
  const forUnpaid = unpaid === "true";
  if (!month || !year) {
    return res.status(400).json({ error: "Month and year are required." });
  }

  const startDate = new Date(`${year}-${month}-01`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  try {
    const invoices = await db
      .collection(collectionName)
      .find({
        company: company,
        invoiceDate: { $gte: startDate, $lt: endDate },
      })
      .toArray();
    const unpaidInvoices = invoices.filter((inv) => !inv.paid);
    const monthNames = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    const monthLabel = monthNames[parseInt(month, 10) - 1];
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${company.toUpperCase()} ${getFileName({
        forGST,
        forUnpaid,
      })} ${monthLabel} ${year}.csv`
    );
    res.setHeader("Content-Type", "text/csv");

    const csvStream = format({
      headers: getCSVHeader({ forGST, forUnpaid }),
    });
    csvStream.pipe(res);
    const rows = getCsvBody({
      forGST,
      forUnpaid,
      data: forUnpaid ? unpaidInvoices : invoices,
    });

    rows.forEach((row) => {
      csvStream.write(row);
    });

    csvStream.end();
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/hsn-codes", async (req, res) => {
  try {
    const hsnCollection = db.collection("hsnCodes");
    const hsnCodes = await hsnCollection.find({}).toArray();
    res.status(200).json(hsnCodes);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/hsn-codes", async (req, res) => {
  try {
    const hsnCollection = db.collection("hsnCodes");
    let result = await hsnCollection.insertOne(req.body);
    res.status(201).send(result);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/hsn-codes/:hsnId", async (req, res) => {
  try {
    const { hsnId } = req.params;
    const result = await db.collection("hsnCodes").findOneAndDelete({
      _id: new ObjectId(hsnId),
    });
    res.status(201).send(result);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/search/invoice", async (req, res) => {
  try {
    const {
      searchTerm,
      startDate,
      endDate,
      company,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query object
    const query = {};

    // Add company filter if provided
    if (company) {
      query.company = company;
    }

    // Add search term across multiple fields if provided
    if (searchTerm) {
      query.$or = [
        // Search in invoice number
        { "invoiceDetail.invoiceNO": { $regex: searchTerm, $options: "i" } },
        // Search in customer name
        { "buyerDetail.customer": { $regex: searchTerm, $options: "i" } },
        { "goodsDescription.po": { $regex: searchTerm, $options: "i" } },
        // Search in items array descriptions
        {
          "goodsDescription.items": {
            $elemMatch: {
              description: { $regex: searchTerm, $options: "i" },
            },
          },
        },
        {
          "goodsDescription.items": {
            $elemMatch: {
              wo: { $regex: searchTerm, $options: "i" },
            },
          },
        },
      ];
    }

    // Add date range if provided
    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) {
        query.invoiceDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.invoiceDate.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    // const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search with pagination
    let [invoices, totalCount] = await Promise.all([
      db
        .collection(collectionName)
        .find(query)
        // .sort({ "invoiceDetail.invoiceNO": -1 })
        .sort({ invoiceDate: -1 })
        // .skip(skip)
        // .limit(parseInt(limit))
        .toArray(),
      db.collection(collectionName).countDocuments(query),
    ]);

    const sortedInvoices = invoices.sort((a, b) => {
      const aNum = parseInt(a.invoiceDetail.invoiceNO.split("-").pop()) || 0;
      const bNum = parseInt(b.invoiceDetail.invoiceNO.split("-").pop()) || 0;
      return bNum - aNum; // descending order
    });

    res.status(200).json({
      data: sortedInvoices,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      totalItems: totalCount,
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});
router.post("/update/payment", async (req, res) => {
  try {
    const { file, fileName } = req.body;
    if (!file) return res.status(400).json({ error: "File is required" });

    const invoiceCollection = db.collection(collectionName);
    const paymentCollection = db.collection("payment");

    const buffer = Buffer.from(file, "base64");
    const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");

    // Fast idempotency check; also put a UNIQUE INDEX on payment.fileHash
    const existingByHash = await paymentCollection.findOne(
      { fileHash },
      { projection: { fileName: 1, _id: 0 } }
    );
    if (existingByHash) {
      return res.status(409).json({
        error: "File already uploaded (same file contents)",
        fileName: existingByHash.fileName || null,
      });
    }

    // Parse once (consider streaming if files can be huge)
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

    // Filter & prepare keys
    const entries = [];
    for (const row of rows) {
      if ((row["Posting Key Name"] || "").trim() !== "Invoice") continue;
      const refNo = row["Reference Number"];
      if (!refNo) continue;
      const amount = Math.round(Math.abs(Number(row["Amount"] || 0)));
      entries.push({ refNo, amount });
    }
    if (entries.length === 0) {
      return res.status(400).json({ error: "No invoice rows found in file." });
    }

    const refNos = [...new Set(entries.map(e => e.refNo))];

    // Fetch all invoices in one go
    const invoices = await invoiceCollection
      .find(
        { "invoiceDetail.invoiceNO": { $in: refNos } },
        {
          projection: {
            "invoiceDetail.invoiceNO": 1,
            "goodsDescription.Total": 1,
            paid: 1,
            invoiceDate: 1,
            _id: 0,
          },
        }
      )
      .toArray();

    // Build a map for quick lookup
    const byNo = new Map(invoices.map(doc => [doc.invoiceDetail.invoiceNO, doc]));

    const bulkOps = [];
    const updates = [];
    const alreadyPaid = [];

    for (const { refNo, amount } of entries) {
      const invoice = byNo.get(refNo);
      if (!invoice) continue; // no match in DB

      if (invoice.paid) {
        alreadyPaid.push({ invoiceNo: refNo, amount });
        continue;
      }

      const total = Number(invoice.goodsDescription?.Total || 0);
      const duePayment = Math.max(0, total - amount);

      bulkOps.push({
        updateOne: {
          filter: { "invoiceDetail.invoiceNO": refNo },
          update: {
            $set: {
              paid: true,
              paymentAmount: amount,
              bulkUpload: true,
              duePayment,
            },
          },
        },
      });

      updates.push({
        referenceNumber: refNo,
        paidAmount: amount,
        invoiceAmount: total,
        bulkUpload: true,
        invoiceDate: invoice.invoiceDate || null,
      });
    }

    if (bulkOps.length === 0) {
      // Record the attempt (optional), but respond clearly
      return res.status(500).json({ error: "No invoices were updated" });
    }

    // Execute all updates at once
    const bulkResult = await invoiceCollection.bulkWrite(bulkOps, { ordered: false });

    // Write the payment record (consider unique index: { fileHash: 1 }, unique: true)
    await paymentCollection.insertOne({
      updates,
      alreadyPaid, // keep this if you want to show it later
      date: new Date(),
      createdAt: new Date(),
      fileName: fileName || "",
      fileHash,
    });

    return res.json({
      message: "Bulk update completed",
      totalUpdated: bulkResult.modifiedCount || updates.length,
      alreadyPaidCount: alreadyPaid.length,
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/payment-details", async (req, res) => {
  let query = {};
  const { month, year } = req.query;

  if (month && year) {
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    query.date = { $gte: startDate, $lt: endDate };
  }

  try {
    const paymentCollection = db.collection("payment");
    const invoiceCollection = db.collection("invoices");
    const payments = await paymentCollection
      .find(query)
      .sort({ date: -1 })
      .toArray();

    const invoices = await invoiceCollection
    .find(query)
    .toArray();

    const totalInvoiceAmount = invoices.reduce((sum, inv) => {
      const amt = Number(inv.goodsDescription?.Total || 0);
      return sum + (Number.isFinite(amt) ? amt : 0);
    }, 0);
    const totalPaidAmount = payments.reduce((sum, inv) => {
      const amt = Number(inv.paidAmount || 0);
      return sum + (Number.isFinite(amt) ? amt : 0);
    }, 0);


    // 🔑 Group by only the date (yyyy-mm-dd), not time
    const merged = Object.values(
      payments.reduce((acc, doc) => {
        const day = new Date(doc.date).toISOString().split("T")[0];
        if (!acc[day]) {
          acc[day] = {
            ...doc,
            updates: [...doc.updates],
            date: doc.date,
          };
        } else {
          acc[day].updates.push(...doc.updates);
        }
        return acc;
      }, {})
    );

    // 🔑 Sort updates inside each day by invoice number (descending)
    merged.forEach((dayDoc) => {
      dayDoc.updates.sort((a, b) => {
        // Extract the number from referenceNumber, e.g. "AE/25-26-203" → 203
        const numA = parseInt(a.referenceNumber?.split("-").pop(), 10);
        const numB = parseInt(b.referenceNumber?.split("-").pop(), 10);
        return numB - numA; // bigger first
      });
    });

    if (merged.length === 0) {
      return res.status(404).json({ error: "No payment records found" });
    }

    res.status(200).json(merged);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/duplicate/invoice/collection", async (req, res) => {
  const collection = db.collection("invoices");
  const newCollection = "invoicesCopy";
  await collection
    .aggregate([{ $match: {} }, { $out: newCollection }])
    .toArray();

  res.status(200).send(`Collection duplicated to ${newCollection}`);
});

export default router;
