import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Employee from "./routes/employee/employee.js";
import Attendance from "./routes/attendance/attendance.js";
import {cron} from "./controller.js"

const PORT = process.env.PORT || 5050;
const app = express();

// Allow requests from http://localhost:5173
const corsOptions = {
  origin: 'http://localhost:5174',
  // origin: 'https://ashok-enterprises.vercel.app',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
console.log(process.env.NODE_ENV)
app.use(cors(corsOptions));
app.use(express.json());

// api routes
app.use('/cron', cron)
app.use("/employee", Employee);
app.use("/attendance", Attendance);


// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
