const pool = require("../config/db");

// 1. Fetch ALL subscriptions (Admin View)
const getSubscriptions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id, 
        u.name AS user_name, 
        p.name AS plan_name, 
        s.status,
        s.start_date,
        s.end_date
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN plans p ON s.plan_id = p.id
      ORDER BY s.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

// 2. Create a new subscription with expiration of old active plans
const createSubscription = async (req, res) => {
  try {
    const { user_id, plan_id } = req.body;

    // EXPIRE OLD PLAN
    await pool.query(
      `
      UPDATE subscriptions
      SET status = 'expired'
      WHERE user_id = $1
      AND status = 'active'
      `,
      [user_id]
    );

    // GET PLAN DETAILS
    const plan = await pool.query(
      `
      SELECT *
      FROM plans
      WHERE id = $1
      `,
      [plan_id]
    );

    if (plan.rows.length === 0) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const duration = plan.rows[0].duration_months;

    // CREATE NEW PLAN
    const result = await pool.query(
      `
      INSERT INTO subscriptions
      (
        user_id,
        plan_id,
        status,
        start_date,
        end_date
      )
      VALUES
      (
        $1,
        $2,
        'active',
        NOW(),
        NOW() + ($3 || ' month')::interval
      )
      RETURNING *
      `,
      [
        user_id,
        plan_id,
        duration
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

// 3. Fetch ONLY active subscriptions for a single specific user ID
const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await pool.query(
      `SELECT 
        s.id, 
        p.name AS plan_name, 
        p.price,
        p.duration_months,
        s.status,
        s.start_date,
        s.end_date
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.user_id = $1
       AND s.status = 'active'
       ORDER BY s.id DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

// 4. Get aggregated dashboard statistics targeting ACTIVE allocations
const getUserDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    const latestPlan = await pool.query(
      `
      SELECT
        p.name AS plan_name,
        s.status
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE s.user_id = $1
      AND s.status = 'active'
      LIMIT 1
      `,
      [id]
    );

    const totalSubscriptions = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM subscriptions
      WHERE user_id = $1
      `,
      [id]
    );

    res.json({
      plan_name: latestPlan.rows[0]?.plan_name || "No Plan",
      status: latestPlan.rows[0]?.status || "Inactive",
      totalSubscriptions: parseInt(totalSubscriptions.rows[0].total, 10) || 0
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

module.exports = {
  getSubscriptions,
  createSubscription,
  getUserSubscriptions,
  getUserDashboard
};