const express = require("express");
const router = express.Router();

// Updated: Imported all four CRUD pipeline operations
const {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan
} = require("../controllers/planController");

// Debug logging to verify the import state
console.log("updatePlan =", updatePlan);

// Core CRUD REST Endpoints
router.get("/", getPlans);
router.post("/", createPlan);
router.put("/:id", updatePlan);
router.delete("/:id", deletePlan); // Added: Mounts plan elimination endpoint

module.exports = router;