import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Employee from "./routes/employee/employee.js";
import Attendance from "./routes/attendance/attendance.js";
import Billing from "./routes/billing/invoice-config/index.js";
import PurchaseOrder from "./routes/purchase-order/index.js"
// import Quotation from "./routes/quotation/index.js"
import ASN from "./routes/ASN/index.js"
import { cron } from "./controller.js";
import {fetchETimeOfficeDataCron} from "./eTimeOfficeCron.js"
import path from "path";
import { fileURLToPath } from "url";
import { connectToDB } from "./db/connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5050;
const app = express();

const startServer = async () => {

  app.use(cors({
    exposedHeaders: ["Content-Disposition"]
  }));

  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use("/cron", cron);
  app.use("/biometric/cron", fetchETimeOfficeDataCron)
  app.use("/employee", Employee);
  app.use("/attendance", Attendance);
  app.use("/billing", Billing);
  app.use("/purchase-order", PurchaseOrder)
  app.use("/ASN", ASN)
  // app.use("/quotation", Quotation)

  app.get("/health", (req, res) => {
    res.send("OK");
  });

  app.use("*", (req, res) => {
    console.log("🔍 Unmatched route accessed:", req.originalUrl);
    res.status(404).send("Not found");
  });
  await connectToDB();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
};

startServer();
