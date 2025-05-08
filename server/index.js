import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Employee from "./routes/employee/employee.js";
import Attendance from "./routes/attendance/attendance.js";
import Billing from "./routes/billing/invoice-config/index.js"
import {cron} from "./controller.js"
import path from 'path';
import { fileURLToPath } from "url";
const PORT = process.env.PORT || 5050;
const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allow requests from http://localhost:5173
const corsOptions = {
  // origin: 'http://localhost:5173',
  origin: 'https://ashok-enterprises.vercel.app',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
console.log(process.env.NODE_ENV)

app.use(cors({
  exposedHeaders: ["Content-Disposition"]
}));
app.use(express.json());

//public path
app.use(express.static(path.join(__dirname, 'public')));

// api routes
app.use('/cron', cron)
app.use("/employee", Employee);
app.use("/attendance", Attendance);
app.use("/billing", Billing);

app.get("/health", (req, res) => {
  res.send("OK");
});


// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
