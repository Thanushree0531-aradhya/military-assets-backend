const express = require("express");
const db = require("../db"); // PostgreSQL pool
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// =====================
// Dashboard Stats Route
// Only ADMIN and BASE_COMMANDER can access
// =====================
router.get(
  "/stats",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"),
  async (req, res) => {
    try {
      console.log("=== Dashboard Stats Access ===");
      console.log("User info from token:", req.user);

      const basesResult = await db.query("SELECT COUNT(*) AS count FROM bases");
      const purchasesResult = await db.query("SELECT COUNT(*) AS count FROM purchases");
      const transfersResult = await db.query("SELECT COUNT(*) AS count FROM transfers");

      res.json({
        totalBases: parseInt(basesResult.rows[0].count) || 0,
        totalPurchases: parseInt(purchasesResult.rows[0].count) || 0,
        totalTransfers: parseInt(transfersResult.rows[0].count) || 0,
      });
    } catch (err) {
      console.error("Dashboard stats error:", err);
      res.status(500).json({ message: "Server error fetching stats", error: err.message });
    }
  }
);

// =====================
// Logistics Panel Route
// Only LOGISTICS_OFFICER can access
// =====================
router.get(
  "/logistics",
  authenticate,
  authorize("LOGISTICS_OFFICER"),
  async (req, res) => {
    try {
      console.log("=== Logistics Panel Access ===");
      console.log("User info from token:", req.user);

      // Fetch any logistics-specific data if needed, or just return message
      res.json({
        message: "Welcome Logistics Officer! You can manage purchases and transfers.",
      });
    } catch (err) {
      console.error("Logistics panel error:", err);
      res.status(500).json({ message: "Server error fetching logistics panel", error: err.message });
    }
  }
);

// =====================
// General User Info Route
// All authenticated users can access
// =====================
router.get("/me", authenticate, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;





