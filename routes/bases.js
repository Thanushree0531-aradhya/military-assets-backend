const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

/* ===================== AUTH MIDDLEWARE ===================== */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token missing" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret"
    );
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

/* ===================== GET ALL BASES ===================== */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name, location FROM bases ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch bases error:", err);
    res.status(500).json({ message: "Failed to fetch bases" });
  }
});

/* ===================== GET BASES FOR DROPDOWN ===================== */
// Optional: return only id + name (frontend dropdown-friendly)
router.get("/dropdown", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name FROM bases ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch dropdown bases error:", err);
    res.status(500).json({ message: "Failed to fetch bases for dropdown" });
  }
});

module.exports = router;



