const pool = require("../config/db");

// 1. Fetch ALL available pricing tiers
const getPlans = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM plans ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

// 2. Commit a new pricing configuration model into the platform matrix
const createPlan = async (req, res) => {
  try {
    const { name, price, duration_months } = req.body;

    const result = await pool.query(
      `
      INSERT INTO plans
      (name, price, duration_months)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [name, price, duration_months]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

// 3. Modify an existing pricing plan configuration
const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration_months } = req.body;

    const result = await pool.query(
      `
      UPDATE plans
      SET
        name = $1,
        price = $2,
        duration_months = $3
      WHERE id = $4
      RETURNING *
      `,
      [name, price, duration_months, id]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

// 4. Remove a pricing configuration tier from the system matrix
const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM plans WHERE id = $1",
      [id]
    );

    res.json({
      message: "Plan Deleted Successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

// Complete module exports configuration block with delete capability
module.exports = {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan
};

console.log("PLAN EXPORTS:", module.exports);