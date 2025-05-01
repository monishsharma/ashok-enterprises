import express from "express";
import InvoiceConfig from "./schema.js";
import db from "../../../db/connection.js";
import ejs from 'ejs';
import path from 'path';
// import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { ObjectId } from "mongodb";
const router = express.Router();
import { ToWords } from 'to-words';
import fs from "fs"
import { format } from '@fast-csv/format';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


// Puppeteer config
let browser;
let isProduction = process.env.NODE_ENV === "prod";

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
  localeCode: 'en-IN',
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
})


router.get('/vendor/list', async (req,res) => {
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
})

router.get('/invoice/list/:company', async (req,res) => {
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
    const invoiceCollection = db.collection("invoices");
    const totalCount = await invoiceCollection.countDocuments(query);
    const invoiceList = await invoiceCollection
      .find(query)
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
        totalItems: totalCount
      });

    } catch (error) {
      console.error("❌ Server Error:", error);
      res.status(500).json({ error: "Server error" });
    }
})

router.get('/invoice/:id', async (req,res) => {
  const id = new ObjectId(req.params.id);
  console.log("Param ID:", req.params.id); // Should print "67f77e75cb0bc5dfaccc4760"
  console.log("Is Valid:", ObjectId.isValid(req.params.id));
  try {
    const invoiceCollection = await db.collection("invoices").findOne({_id:id});
      if (!invoiceCollection) {
        return res.status(404).json({ error: "invoice not found" });
    }

    res.status(200).json(invoiceCollection);
    } catch (error) {
      console.error("❌ Server Error:", error);
      res.status(500).json({ error: "Server error" });
    }
})

router.get('/vendor/:id', async (req, res) => {
  const vendorId = new ObjectId(req.params.id); // assuming id is ObjectId

  try {
    const result = await db.collection("vendors").findOne(
      { "vendors.id": vendorId }, // this assumes vendors.id is an ObjectId
      { projection: { "vendors.$": 1 } }
    );

    res.json(result);
  } catch (err) {
    console.error('Error fetching vendor:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/update/vendor/list', async (req, res) => {
  const payload = req.body.map(v => {
      v.id = new ObjectId(v.id)
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
  } catch(error) {
    console.error("❌ Server Error:", error);
      res.status(500).json({ error: "Server error" });
  }
})

router.post('/invoice', async (req, res) => {
  const data = req.body;
  const company = data.invoiceDetail.company || "ASHOK";

  try {
    // Check for duplicate invoice number
    const existing = await db.collection("invoices").findOne({
      "invoiceDetail.invoiceNO": data.invoiceDetail.invoiceNO,
      company: company
    });


    if (existing) {
      return res.status(400).json({
        error: "Invoice number already exists."
      });
    }

    // Add metadata
    data._id = new ObjectId();
    data.company = company;
    data.invoiceDate = new Date(data.invoiceDetail.invoiceDate);

    await db.collection("invoices").insertOne(data);

    const [prefix, year, number] = data.invoiceDetail.invoiceNO.split('-'); // AE-25-26-02
    const nextNumber = (parseInt(number, 10) + 1).toString().padStart(2, '0');

    await db.collection("billing").updateOne(
      {}, // assuming only one document
      {
        $set: {
          [`${company}.lastInvoiceNo`]: number,
          [`${company}.nextInvoiceNo`]: nextNumber
        }
      }
    );

    res.status(201).json({ message: "Invoice saved", id: data._id });

  } catch (error) {
    console.error("Error saving invoice:", error);
    res.status(500).send("Internal server error");
  }
});


router.patch('/update/invoice/:id', async (req, res) => {
  const id = new ObjectId(req.params.id);
  const payload = req.body;
  if (payload._id) {
    delete payload._id;
  }
  if (payload.invoiceDate && typeof payload.invoiceDate === "string") {
    payload.invoiceDate = new Date(payload.invoiceDate);
  }
  try {
    const result = await db.collection("invoices").updateOne(
      { _id: id },
      { $set: payload }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.status(200).json({ message: "Invoice saved", id: id });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/generate-pdf/:id/:downloadOriginal', async (req, res) => {

  const browser = await getBrowser();
  const page = await browser.newPage();

  const { id } = req.params;

  try {
    const data = await db.collection("invoices").findOne({ _id: new ObjectId(id) });
    if (!data) return res.status(404).send("Invoice not found");
    const img = data.company === "ASHOK" ? 'ashoklogo.png' : 'padma.png'
    const bankDetail = data.company === "PADMA" ? `
        <ul style="margin: 0; text-align: left; padding-left: 20px; list-style-type: decimal; line-height: 1.5;">
        <li>HDFC Bank (Kanti Nagar Gwalior, MP, 474002)<br />A/C NO: 50200047766504 <br/> IFSC CODE: HDFC0009437</li>
        <li>Goods once sold will not be back</li>
        <li>Subject to Gwalior jurisdiction only</li>
        </ul>`: `
        <ul style="margin: 0; text-align: left; padding-left: 20px; list-style-type: decimal; line-height: 1.5;">
        <li>STATE BANK OF INDIA (SME BRANCH PATANKAR BAZAR LASHKAR)<br />A/C NO: 63008044566 <br/> IFSC CODE: SBIN0030119</li>
        <li>Goods once sold will not be back</li>
        <li>Subject to Gwalior jurisdiction only</li>
        </ul>`;

    const logoPath = path.join(__dirname, img);
    const imageBuffer = fs.readFileSync(logoPath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = 'image/png'; // or jpg if it's jpeg
    const logoDataURI = `data:${mimeType};base64,${base64Image}`;
    const amountInWords = `Indian Rupees ${convertAmountToWords(data.goodsDescription.Total)}`;
    const date = new Date(data.invoiceDetail.invoiceDate);
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    const html = await ejs.renderFile(path.join(__dirname, './templates/invoice.ejs'), {
      data,
      formattedDate,
      amountInWords,
      logoBase64: logoDataURI,
      bankDetail,
      showLogo: req.params.downloadOriginal === 'true'
    });

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'LEGAL',
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
      printBackground: true,
      scale: 1
    });

    await page.close(); // don't close browser, just the page
    const sanitizeFilename = (name) =>
      name.replace(/[\/\\:*?"<>|]/g, '-');
    const invoiceNo = data.invoiceDetail.invoiceNO || 'invoice';
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${sanitizeFilename(invoiceNo)}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Internal server error");
  }
});

router.get('/generate-csv', async (req,res) => {

  const { month, year, company } = req.query;
  if (!month || !year) {
    return res.status(400).json({ error: 'Month and year are required.' });
  }

  const startDate = new Date(`${year}-${month}-01`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  try {
    const invoices = await db.collection("invoices").find({
      company: company,
      invoiceDate: { $gte: startDate, $lt: endDate }
    }).toArray()
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const monthLabel = monthNames[parseInt(month, 10) - 1];

    res.setHeader('Content-Disposition', `attachment; filename=${company.toUpperCase()} SALES ${monthLabel} ${year}.csv`);
    res.setHeader('Content-Type', 'text/csv');



    const csvStream = format({ headers: [
      'S N0', 'BILL', 'DATE', 'HSN', 'QTY', "TYPE", 'SGST 9%', 'CGST 9%', 'TAXABLE VALUE', 'AMOUNT', 'FREIGHT'
    ]});
    csvStream.pipe(res);
    let sn =1;

    invoices.forEach(invoice => {
      const billNo = invoice.invoiceDetail?.invoiceNO || '';
      const invoiceDate = new Date(invoice.invoiceDate).toISOString().split('T')[0];
      const hsn = invoice.goodsDescription?.HSN || '';
      const freight = invoice.goodsDescription?.freight || 0;
      const amount = invoice.goodsDescription.Total || 0;
      const items = invoice.goodsDescription?.items || [];
      const sgst = invoice.goodsDescription.SGST;
      const cgst = invoice.goodsDescription.SGST;
      const taxableValue = invoice.goodsDescription.taxableValue
      let totalQty = 0;
      items.forEach((item,index) => {
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
        freight
      ]);
    });
    csvStream.end();


  } catch(err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }

})


export default router;