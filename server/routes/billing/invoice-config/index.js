import express from "express";
import db from "../../../db/connection.js";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { ObjectId } from "mongodb";
import { ToWords } from "to-words";
import fs from "fs";
import { format } from "@fast-csv/format";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));


// Puppeteer config
let browser;
let isProduction = process.env.NODE_ENV === "prod";

// Logo caching
const logoMap = {
  ASHOK: "ashoklogo.png",
  PADMA: "padma.png",
};

const base64Logos = {};
for (const [key, file] of Object.entries(logoMap)) {
  const imageBuffer = fs.readFileSync(path.join(__dirname, file));
  base64Logos[key] = `data:image/png;base64,${imageBuffer.toString("base64")}`;
}

// Compile EJS template once
const invoiceTemplateString = fs.readFileSync(
  path.join(__dirname, "./templates/invoice.ejs"),
  "utf8"
);
const compiledInvoiceTemplate = ejs.compile(invoiceTemplateString);

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
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.status(200).json(vendorList);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/invoice/list/:company", async (req, res) => {
  const company = req.params.company;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const invoiceCollection = db.collection("invoices");
    const totalCount = await invoiceCollection.countDocuments({ company: company });
    const invoiceList = await invoiceCollection
      .find({ company: company })
      .sort({ "invoiceDetail.invoiceNO": -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    if (!invoiceList || invoiceList.length === 0) {
      return res.status(404).json({ error: "No invoices found" });
    }

    res.status(200).json({
      data: invoiceList,
      currentPage: page,
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
    const invoiceCollection = await db.collection("invoices").findOne({ _id: id });
    if (!invoiceCollection) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.status(200).json(invoiceCollection);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/generate-pdf/:id/:downloadOriginal", async (req, res) => {
  console.time("pdf-generation");

  const { id, downloadOriginal } = req.params;

  try {
    console.time("browser-launch");
    const browser = await getBrowser();
    const page = await browser.newPage();
    console.timeEnd("browser-launch");

    console.time("db-fetch");
    const data = await db.collection("invoices").findOne({ _id: new ObjectId(id) });
    console.timeEnd("db-fetch");

    if (!data) return res.status(404).send("Invoice not found");

    const logoDataURI = base64Logos[data.company];
    const amountInWords = `Indian Rupees ${convertAmountToWords(data.goodsDescription.Total)}`;

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

    console.time("html-render");
    const html = compiledInvoiceTemplate({
      data,
      amountInWords,
      logoBase64: logoDataURI,
      bankDetail,
      showLogo: downloadOriginal === "true",
    });
    console.timeEnd("html-render");

    console.time("set-content");
    await page.setContent(html, { waitUntil: "load" }); // Faster than networkidle0
    console.timeEnd("set-content");

    console.time("generate-pdf");
    const pdfBuffer = await page.pdf({
      format: "LEGAL",
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
      printBackground: true,
      scale: 1,
    });
    console.timeEnd("generate-pdf");

    await page.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=invoice.pdf",
      "Content-Length": pdfBuffer.length,
    });

    console.timeEnd("pdf-generation");
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Internal server error");
  }
});


router.get("/generate-csv", async (req, res) => {
  const { month, year, company } = req.query;
  if (!month || !year) {
    return res.status(400).json({ error: "Month and year are required." });
  }

  const startDate = new Date(`${year}-${month}-01`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  try {
    const invoices = await db
      .collection("invoices")
      .find({
        company: company,
        invoiceDate: { $gte: startDate, $lt: endDate },
      })
      .toArray();
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
      `attachment; filename=${company.toUpperCase()} SALES ${monthLabel} ${year}.csv`
    );
    res.setHeader("Content-Type", "text/csv");

    const csvStream = format({
      headers: [
        "S N0",
        "BILL",
        "DATE",
        "HSN",
        "QTY",
        "TYPE",
        "SGST 9%",
        "CGST 9%",
        "TAXABLE VALUE",
        "AMOUNT",
        "FREIGHT",
      ],
    });
    csvStream.pipe(res);

    let sn = 1;

    invoices.forEach((invoice) => {
      const billNo = invoice.invoiceDetail?.invoiceNO || "";
      const invoiceDate = new Date(invoice.invoiceDate)
        .toISOString()
        .split("T")[0];
      const hsn = invoice.goodsDescription?.HSN || "";
      const freight = invoice.goodsDescription?.freight || 0;
      const amount = invoice.goodsDescription.Total || 0;
      const items = invoice.goodsDescription?.items || [];
      const sgst = invoice.goodsDescription.SGST;
      const cgst = invoice.goodsDescription.SGST;
      const taxableValue = invoice.goodsDescription.taxableValue;
      let totalQty = 0;
      items.forEach((item) => {
        totalQty += parseFloat(item.qty) || 0;
      });
      csvStream.write([
        sn++,
        billNo.split("-")[2],
        invoiceDate,
        hsn,
        totalQty,
        "",
        sgst,
        cgst,
        taxableValue,
        amount,
        freight,
      ]);
    });
    csvStream.end();
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
