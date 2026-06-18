const pool = require("../config/db");
const sendInvoiceEmail = require("../utils/sendInvoiceEmail");
const generateInvoice = require("../utils/generateInvoice");

// GET ALL INVOICES
const getInvoices = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM invoices
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

// CREATE INVOICE
const createInvoice = async (req, res) => {
  try {
    const {
      user_id,
      payment_id,
      amount
    } = req.body;

    const invoiceNumber = "INV-" + Date.now();

    const result = await pool.query(
      `
      INSERT INTO invoices
      (
        user_id,
        payment_id,
        invoice_number,
        amount
      )
      VALUES
      ($1,$2,$3,$4)
      RETURNING *
      `,
      [
        user_id,
        payment_id,
        invoiceNumber,
        amount
      ]
    );

    const user = await pool.query(
      `
      SELECT email
      FROM users
      WHERE id = $1
      `,
      [user_id]
    );

    const pdfPath = generateInvoice(
      invoiceNumber,
      user.rows[0].email,
      amount
    );

    await sendInvoiceEmail(
      user.rows[0].email,
      invoiceNumber,
      amount,
      pdfPath
    );

    res.status(201).json(
      result.rows[0]
    );

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

module.exports = {
  getInvoices,
  createInvoice
};