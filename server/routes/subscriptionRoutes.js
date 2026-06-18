const express = require("express");
const router = express.Router();

// Destructured controller functions including the newly added getUserDashboard
const {
  getSubscriptions,
  createSubscription,
  getUserSubscriptions,
  getUserDashboard
} = require("../controllers/subscriptionController");

// Standard resource collection paths (Admin View)
router.get("/", getSubscriptions);
router.post("/", createSubscription);

// Route to fetch specific subscription history list attached to a given User ID
router.get("/user/:id", getUserSubscriptions);

// Route to pull the single latest active plan summary for a user's dashboard view
router.get("/dashboard/:id", getUserDashboard);

module.exports = router;