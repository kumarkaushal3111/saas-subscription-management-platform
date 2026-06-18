require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

// Route Modules
const authRoutes = require("./routes/authRoutes"); 
const planRoutes = require("./routes/planRoutes"); 
const subscriptionRoutes = require("./routes/subscriptionRoutes");  
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes"); // Added: Invoice Router Link

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Route Middlewares
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes); 
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/invoices", invoiceRoutes); // Added: Mounts invoice data stream pathways

// Root Diagnostics Route
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});