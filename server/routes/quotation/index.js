import express from "express";
import { ObjectId } from "mongodb";
import { db } from "../../db/connection.js";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { getNextNumber } from "../../helper/get-next-number..js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let browser;
let isProduction = process.env.NODE_ENV === "prod";
// const collectionName = isProduction ? "invoices" : "invoices";
// const quotationCollection = isProduction ? "invoices" : "invoicesCopy";
// const configCollection = isProduction ? "invoices" : "invoicesCopy";

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

router.get("/get-quotation/:company", async (req, res) => {
  const company = req.params.company;
  let query = { company: company };

  try {
    const quotationCollection = db.collection("quotation");

    const quotationList = await quotationCollection.find(query).toArray();

    if (!quotationList || quotationList.length === 0) {
      return res.status(200).json({ error: "No quotation found" });
    }

    const sortedQuotation = quotationList.sort((a, b) => {
      const aNum =
        parseInt(a.quotationDetail.quotationNo.split("-").pop()) || 0;
      const bNum =
        parseInt(b.quotationDetail.quotationNo.split("-").pop()) || 0;
      return bNum - aNum; // descending order
    });

    res.status(200).json({
      data: sortedQuotation,
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/save-quotation", async (req, res) => {
  const data = req.body;
  const company = data.quotationDetail.quotationCompany;
  data._id = new ObjectId();
  data.quotationDate = new Date(data.quotationDetail.quotationDate);
  data.company = company;

  try {
    const collection = db.collection("quotation");
    await collection.insertOne(data);
    const { lastDocumentNo, nextNumber } = getNextNumber(
      data.quotationDetail.quotationNo,
    );

    await db.collection("billing").updateOne(
      {}, // assuming only one document
      {
        $set: {
          [`quotation.${company}.lastQuotationNo`]: lastDocumentNo,
          [`quotation.${company}.nextQuotationNo`]: nextNumber,
        },
      },
    );
    res.status(200).send({ message: "Quotation saved successfully" });
  } catch (error) {
    res.status(500).send({ message: "Error saving quotation", error });
  }
});

router.put("/update-quotation/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data._id) delete data._id;

    const collection = db.collection("quotation");

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: data });

    res.status(200).send({ message: "Quotation updated successfully" });
  } catch (error) {
    res.status(500).send({ message: "Error updating quotation", error });
  }
});

router.get("/get-quotation-by-id/:id", async (req, res) => {
  const id = new ObjectId(req.params.id);
  try {
    const quotationCollection = await db
      .collection("quotation")
      .findOne({ _id: id });
    if (!quotationCollection) {
      return res.status(404).json({ error: "quotation not found" });
    }

    res.status(200).json(quotationCollection);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/generate-quotation-pdf/:id", async (req, res) => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  // const downloadOriginal = req.params.downloadOriginal === "true";
  const { id } = req.params;

  try {
    const data = await db
      .collection("quotation")
      .findOne({ _id: new ObjectId(id) });
    if (!data) return res.status(404).send("Quotation not found");

    const companyType = data.company || "ASHOK";
    const img =
      companyType === "ASHOK" ? "quotationAshok.png" : "quotationPadma.png";

    const logoPath = path.join(__dirname, img);
    const imageBuffer = fs.readFileSync(logoPath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = "image/png"; // or jpg if it's jpeg
    const logoDataURI = `data:${mimeType};base64,${base64Image}`;

    const date = new Date(data.quotationDetail.quotationDate);
    const formattedDate = `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}-${date.getFullYear()}`;
    // const returnHeight = () => {
    //   if (data.company === "ASHOK") {
    //     if (req.params.downloadOriginal) return "190px";
    //     return "250px";
    //   }
    //   return "230px";
    // };

    const html = await ejs.renderFile(
      path.join(__dirname, "./template/quotation.ejs"),
      {
        data,
        formattedDate,
        logoBase64: logoDataURI,
        sealText:
          companyType === "ASHOK" ? "ASHOK ENTERPRISES" : "PADMA ENGG WORKS",
        height: "250px",
        // circleBottmPercent: getSealLogoTopValue(),
      },
    );

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "LEGAL",
      margin: {
        top: "15px",
        bottom: 0,
        left: "10px",
        right: "10px",
      },
      printBackground: true,
      scale: 0.9,
    });

    await page.close(); // don't close browser, just the page
    const sanitizeFilename = (name) => name.replace(/[\/\\:*?"<>|]/g, "-");

    const quotationNO = data.quotationDetail.quotationNo || "quotation";
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${sanitizeFilename(
        quotationNO,
      )}.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Internal server error");
  }
});

export default router;
