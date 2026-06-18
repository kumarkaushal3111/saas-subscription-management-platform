const pool = require("../config/db");

// Fetch aggregated business health metrics for the administrator dashboard
const getStats = async (req, res) => {
  try {
    // 1. Total system footprint calculations
    const users = await pool.query(
      "SELECT COUNT(*) FROM users"
    );

    const plans = await pool.query(
      "SELECT COUNT(*) FROM plans"
    );

    // 2. Isolate active operational allocations 
    const activeSubscriptions = await pool.query(
      `
      SELECT COUNT(*)
      FROM subscriptions
      WHERE status='active'
      `
    );

    // 3. Aggregate successful payment ledgers with a safe null-fallback
    const revenue = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM payments
      WHERE status='paid'
      `
    );

    // 4. Return the consolidated dataset mappings
    res.json({
      totalUsers: parseInt(users.rows[0].count, 10),
      totalPlans: parseInt(plans.rows[0].count, 10),
      activeSubscriptions: parseInt(activeSubscriptions.rows[0].count, 10),
      totalRevenue: parseFloat(revenue.rows[0].total)
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

module.exports = { getStats };