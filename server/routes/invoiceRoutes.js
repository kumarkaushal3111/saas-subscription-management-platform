const express = require("express");
const router = express.Router();

// Updated: Imported both query and creation control pipelines for invoices
const {
  getInvoices,
  createInvoice
} = require("../controllers/invoiceController");

// Core REST Endpoints for Invoices
router.get("/", getInvoices);
router.post("/", createInvoice); // Added: Mounts invoice generation endpoint

module.exports = router;