const pool = require("../config/db");
const razorpay = require("../config/razorpay");

// 1. Initialize a transaction pool mapping request on Razorpay's API
const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // Standard 100 paise per INR conversion factor
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json(order);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Order Creation Failed"
    });
  }
};

// 2. Commit a finalized transaction ledger entry directly to PostgreSQL
const createPayment = async (req, res) => {
  try {
    const {
      user_id,
      plan_id,
      amount,
      payment_id
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO payments
      (
        user_id,
        plan_id,
        amount,
        payment_id,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        user_id,
        plan_id,
        amount,
        payment_id,
        "paid"
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

// 3. Fetch payment history list for a single specific user ID
const getUserPayments = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        p.id,
        pl.name AS plan_name,
        p.amount,
        p.payment_id,
        p.status,
        p.created_at
      FROM payments p
      JOIN plans pl ON p.plan_id = pl.id
      WHERE p.user_id = $1
      ORDER BY p.id DESC
      `,
      [id]
    );

    res.json(result.rows);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

// 4. Added: Fetch ALL system transactions across all profiles (Admin View)
const getAllPayments = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        p.id,
        u.name AS user_name,
        pl.name AS plan_name,
        p.amount,
        p.payment_id,
        p.status,
        p.created_at
      FROM payments p
      JOIN users u ON p.user_id = u.id
      JOIN plans pl ON p.plan_id = pl.id
      ORDER BY p.id DESC
      `
    );

    res.json(result.rows);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

// Complete consolidated module exports layout
module.exports = {
  createOrder,
  createPayment,
  getUserPayments,
  getAllPayments
};