const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOtpEmail = require("../utils/sendOtpEmail");

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check for empty fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // 2. Prevent duplicate emails
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    // 3. Process registration if checks pass
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
      (
        name,
        email,
        password,
        email_verified
      )
      VALUES
      ($1, $2, $3, true)
      RETURNING id, name, email, email_verified`,
      [name, email, hashedPassword]
    );

    // Log the created user object for debugging
    console.log("Newly registered user:", result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required"
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        email_verified: user.email_verified
      }
    });
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

// SEND OTP
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      `
      INSERT INTO otp_verifications
      (email, otp)
      VALUES ($1, $2)
      `,
      [email, otp]
    );

    await sendOtpEmail(email, otp);

    res.json({
      message: "OTP sent successfully"
    });
  } catch (error) {
    console.log("OTP Send error:", error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

// VERIFY OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await pool.query(
      `
      SELECT *
      FROM otp_verifications
      WHERE email = $1
      AND otp = $2
      ORDER BY id DESC
      LIMIT 1
      `,
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    res.json({
      verified: true
    });
  } catch (error) {
    console.log("OTP Verification error:", error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp
};