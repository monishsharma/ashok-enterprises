import mongoose from "mongoose";

const invoiceConfigSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
    enum: ["Ashok", "Padma"],
  },
  lastInvoiceNo: {
    type: Number,
    required: true,
    default: 0,
  },
  previousInvoiceNo: {
    type: String,
    default: null,
  },
},{ collection: "billing" });


export default mongoose.model('InvoiceConfig', invoiceConfigSchema)

