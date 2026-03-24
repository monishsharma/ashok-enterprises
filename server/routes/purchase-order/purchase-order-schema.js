import mongoose from "mongoose";

const dispatchInvoiceItemSchema = new mongoose.Schema({
  sno: String,
  description: String,
  qty: Number,
  rate: Number
}, { _id: false });

const dispatchInvoiceSchema = new mongoose.Schema({
  invoiceId: mongoose.Schema.Types.ObjectId,
  invoiceNo: String,
  invoiceDate: Date,
  items: [dispatchInvoiceItemSchema],
  qtyDispatch: Number
}, { _id: false });

const itemSchema = new mongoose.Schema({
  itemId: String,
  itemNo: Number,
  description: String,
  hsn: String,
  qty: Number,
  rate: Number,
  value: Number,
  workOrder: String,

  dispatchedQty: {
    type: Number,
    default: 0
  },

  pendingQty: {
    type: Number,
    default: 0
  }

}, { _id: false });

const poSchema = new mongoose.Schema({

  poNumber: {
    type: String,
    required: true
  },

  poDate: String,

  company: String,

  gstin: String,

  items: [itemSchema],

  dispatchedInvoices: [dispatchInvoiceSchema]

}, {
  timestamps: true
});

export default mongoose.model("PurchaseOrder", poSchema);