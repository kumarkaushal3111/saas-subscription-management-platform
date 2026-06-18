const express = require("express");
const router = express.Router();

// Destructured all controller actions from the payment controller assembly
const {
  createOrder,
  createPayment,
  getUserPayments,
  getAllPayments // Added administrative controller method
} = require("../controllers/paymentController");

// Endpoint to initialize transaction pools on Razorpay (Returns order id)
router.post("/create-order", createOrder);

// Endpoint to store successful receipts inside PostgreSQL data tables
router.post("/", createPayment);

// Added: Endpoint to fetch ALL transactions globally across the system (Admin View)
router.get("/", getAllPayments);

// Endpoint to fetch the complete billing/payment history for a specific User ID
router.get("/user/:id", getUserPayments);

module.exports = router;