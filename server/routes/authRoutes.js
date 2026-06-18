const express = require("express");
const router = express.Router();

// Destructure register, login, sendOtp, and verifyOtp from the controller
const {
  register,
  login,
  sendOtp,
  verifyOtp
} = require("../controllers/authController");

// Authentication and OTP Routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", register);
router.post("/login", login);

module.exports = router;