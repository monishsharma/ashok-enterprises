import express from "express";
import InvoiceConfig from "./schema.js";
import {db} from "../../../db/connection.js";
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

router.get('/get/invoice/report/:company', async (req, res) => {
  const company = req.params.company;
  let query = { company: company };
  const { month, year } = req.query;

  try {
    const invoiceCollection = db.collection("invoices");

    let currentMonthInvoices = [];
    let prevMonthInvoices = [];
    let totalCount = 0;
    let preInvoiceCount = 0;
    let invoiceAmount = [];

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
        invoiceDate: { $gte: startDate, $lt: endDate }
      };
      currentMonthInvoices = await invoiceCollection.find(currentQuery).sort({ "invoiceDetail.invoiceNO": -1 }).toArray();
      totalCount = await invoiceCollection.countDocuments(currentQuery);

      // Fetch previous month invoices
      const prevQuery = {
        ...query,
        invoiceDate: { $gte: prevStartDate, $lt: prevEndDate }
      };
      prevMonthInvoices = await invoiceCollection.find(prevQuery).sort({ "invoiceDetail.invoiceNO": -1 }).toArray();
      preInvoiceCount = await invoiceCollection.countDocuments(prevQuery);

    }

    // Helper to calculate totals
    const calculateTotals = (invoices) => {
      let total = 0, paid = 0, unpaid = 0, due = 0;
      invoices.forEach(inv => {
        const amount = parseFloat(inv.goodsDescription.Total);
        invoiceAmount.push(amount)
        total += amount;
        if (inv.paid) {
          paid += inv.paymentAmount || 0
          due += inv.duePayment || 0
        }
        else unpaid += amount;
      });
      return { total, paid, unpaid, due };
    };

    const current = calculateTotals(currentMonthInvoices);
    const previous = calculateTotals(prevMonthInvoices);

    // Calculate percentage and growth flag for invoice amount
let invoiceAmountChange = 0;
let invoiceAmountGrowth = false;
if (previous.total > 0) {
  invoiceAmountChange = ((current.total - previous.total) / previous.total) * 100;
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
  invoiceCountChange = ((totalCount - preInvoiceCount) / preInvoiceCount) * 100;
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
  const fyStart = new Date(selectedYear, 3, 1);   // April 1
  const fyEnd = new Date(selectedYear + 1, 3, 1); // April 1 next year

  const fyInvoices = await invoiceCollection.find({
    ...query,
    invoiceDate: { $gte: fyStart, $lt: fyEnd }
  }).toArray();

  fyInvoices.forEach(inv => {
    const amount = parseFloat(inv.goodsDescription.Total || 0);
    const actualMonth = new Date(inv.invoiceDate).getMonth(); // 0–11

    // Reindex month to start from April as 0, May as 1, ..., March as 11
    const fiscalMonthIndex = (actualMonth + 9) % 12;
    monthlyTotals[fiscalMonthIndex] += amount;
  });
}

const customerTotals = {};

currentMonthInvoices.forEach(invoice => {
  const customer = invoice.buyerDetail.customer || "Unknown";
  const amount = parseFloat(invoice.goodsDescription.Total || 0);

  if (!customerTotals[customer]) {
    customerTotals[customer] = {
      total: 0,
      paid: 0,
      unpaid: 0
    };
  }

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
    invoiceAmountChange: {
      percentage: invoiceAmountChange,
      growth: invoiceAmountGrowth
    },
    invoiceCountChange: {
      percentage: invoiceCountChange,
      growth: invoiceCountGrowth
    },
    customerTotals
});


  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// router.patch(`/update/invoice`, async(req,res) => {

//   const updates = [
//     { invoiceNO: "AE/25-26-36", type: "NOS" },
//     { invoiceNO: "AE/25-26-35", type: "KGS" },
//     { invoiceNO: "AE/25-26-34", type: "KGS" },
//     { invoiceNO: "AE/25-26-33", type: "NOS" },
//     { invoiceNO: "AE/25-26-32", type: "KGS" },
//     { invoiceNO: "AE/25-26-31", type: "KGS" },
//     { invoiceNO: "AE/25-26-30", type: "NOS" },
//     { invoiceNO: "AE/25-26-29", type: "KGS" },
//     { invoiceNO: "AE/25-26-28", type: "KGS" },
//     { invoiceNO: "AE/25-26-27", type: "NOS" },
//     { invoiceNO: "AE/25-26-26", type: "KGS" },
//     { invoiceNO: "AE/25-26-25", type: "NOS" },
//     { invoiceNO: "AE/25-26-24", type: "KGS" },
//     { invoiceNO: "AE/25-26-23", type: "KGS" },
//     { invoiceNO: "AE/25-26-22", type: "NOS" },
//     { invoiceNO: "AE/25-26-21", type: "NOS" },
//     { invoiceNO: "AE/25-26-20", type: "KGS" },
//     { invoiceNO: "AE/25-26-19", type: "KGS" },
//     { invoiceNO: "AE/25-26-18", type: "KGS" },
//     { invoiceNO: "AE/25-26-17", type: "KGS" },
//     { invoiceNO: "AE/25-26-16", type: "KGS" },
//     { invoiceNO: "AE/25-26-15", type: "KGS" },
//     { invoiceNO: "AE/25-26-14", type: "KGS" },
//     { invoiceNO: "AE/25-26-13", type: "KGS" },
//     { invoiceNO: "AE/25-26-12", type: "KGS" },
//     { invoiceNO: "AE/25-26-11", type: "KGS" },
//     { invoiceNO: "AE/25-26-10", type: "KGS" },
//     { invoiceNO: "AE/25-26-09", type: "KGS" },
//     { invoiceNO: "AE/25-26-08", type: "KGS" },
//     { invoiceNO: "AE/25-26-07", type: "NOS" },
//     { invoiceNO: "AE/25-26-06", type: "KGS" },
//     { invoiceNO: "AE/25-26-05", type: "KGS" },
//     { invoiceNO: "AE/25-26-04", type: "NOS" },
//     { invoiceNO: "AE/25-26-03", type: "KGS" },
//     { invoiceNO: "AE/25-26-02", type: "KGS" },
//     { invoiceNO: "AE/25-26-01", type: "KGS" }
//   ];

//   try {

//     for (const { invoiceNO, type } of updates) {
//       const result = await db.collection("invoices").updateOne(
//         { "invoiceDetail.invoiceNO": invoiceNO },
//         { $set: { "goodsDescription.type": type } }
//       );

//       console.log(`Updated ${invoiceNO}:`, result.modifiedCount === 1 ? "Success" : "Not found");
//     }


//     res.json({ message: "Invoice updated successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Update failed" });
//   }
// })


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
    const amountInWords = `Indian Rupees  ${convertAmountToWords(data.goodsDescription.Total)}`;
    const date = new Date(data.invoiceDetail.invoiceDate);
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    const returnHeight = () => {
      if (data.company === "ASHOK") {
        if (req.params.downloadOriginal) return "190px";
        return "250px";
      }
      return "230px";
    }
    const html = await ejs.renderFile(path.join(__dirname, './templates/invoice.ejs'), {
      data,
      formattedDate,
      amountInWords,
      logoBase64: logoDataURI,
      bankDetail,
      showLogo: req.params.downloadOriginal === 'true',
      height: returnHeight(),
      isUniqueVendor: data.buyerDetail.customer == "Rajasthan Explosives"
    });

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'LEGAL',
      margin: { top: req.params.downloadOriginal ? "6px" : "15px", bottom: 0, left: "10px", right: "10px" },
      printBackground: true,
      scale: 0.9
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
      const type = invoice.goodsDescription.type;
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
        type,
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

router.get('/search/invoice', async (req, res) => {
  try {
    const {
      searchTerm,
      startDate,
      endDate,
      company,
      page = 1,
      limit = 10
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
        { "invoiceDetail.invoiceNO": { $regex: searchTerm, $options: 'i' } },
        // Search in customer name
        { "buyerDetail.customer": { $regex: searchTerm, $options: 'i' } },
        // Search in items array descriptions
        { "goodsDescription.items": {
          $elemMatch: {
            description: { $regex: searchTerm, $options: 'i' },
          }
        }},
        { "goodsDescription.items": {
          $elemMatch: {
            wo: { $regex: searchTerm, $options: 'i' }
          }
        }}
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
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search with pagination
    const [invoices, totalCount] = await Promise.all([
      db.collection("invoices")
        .find(query)
        .sort({ "invoiceDetail.invoiceNO": -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      db.collection("invoices").countDocuments(query)
    ]);


    res.status(200).json({
      data: invoices,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      totalItems: totalCount
    });

  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;