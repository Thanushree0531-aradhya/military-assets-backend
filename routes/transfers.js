const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/authMiddleware");
const db = require("../db");

/*
|---------------------------------------------------------------------------
| CREATE TRANSFER
| Roles: ADMIN, LOGISTICS_OFFICER
|---------------------------------------------------------------------------
*/
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  async (req, res) => {
    try {
      let { fromBase, toBase, equipmentType, quantity } = req.body;

      // Basic validation
      if (!fromBase || !toBase || !equipmentType || !quantity) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (fromBase === toBase) {
        return res
          .status(400)
          .json({ message: "From base and To base cannot be the same" });
      }

      if (isNaN(quantity) || quantity <= 0) {
        return res
          .status(400)
          .json({ message: "Quantity must be a positive number" });
      }

      // ----------------------------
      // Map base names to IDs if needed
      // ----------------------------
      if (isNaN(fromBase)) {
        const baseRes = await db.query(
          `SELECT id FROM bases WHERE LOWER(name) = LOWER($1)`,
          [fromBase]
        );
        if (!baseRes.rows[0]) {
          return res.status(400).json({ message: `Invalid source base name: ${fromBase}` });
        }
        fromBase = baseRes.rows[0].id;
      }

      if (isNaN(toBase)) {
        const baseRes = await db.query(
          `SELECT id FROM bases WHERE LOWER(name) = LOWER($1)`,
          [toBase]
        );
        if (!baseRes.rows[0]) {
          return res
            .status(400)
            .json({ message: `Invalid destination base name: ${toBase}` });
        }
        toBase = baseRes.rows[0].id;
      }

      // ----------------------------
      // Map equipmentType to product_id if numeric, else store manual name
      // ----------------------------
      let equipmentId = null;
      if (!isNaN(equipmentType)) {
        // numeric, assume product ID exists
        equipmentId = Number(equipmentType);
      } else {
        // store manual name
        equipmentId = null;
      }

      // ----------------------------
      // Insert transfer record
      // ----------------------------
      const insertQuery = `
        INSERT INTO transfers (from_base, to_base, product_id, equipment_type, quantity, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id, from_base, to_base, product_id, equipment_type, quantity, created_at
      `;
      const transferResult = await db.query(insertQuery, [
        fromBase,
        toBase,
        equipmentId,
        isNaN(equipmentType) ? equipmentType : null,
        quantity,
      ]);

      const transfer = transferResult.rows[0];

      // ----------------------------
      // Return transfer immediately
      // ----------------------------
      return res.status(201).json({
        message: "Transfer recorded successfully",
        transfer,
      });
    } catch (err) {
      console.error("Transfer creation error:", err);
      return res.status(500).json({
        message: "Server error while creating transfer",
        error: err.message,
      });
    }
  }
);

/*
|---------------------------------------------------------------------------
| GET TRANSFERS
| Roles: ADMIN, LOGISTICS_OFFICER, BASE_COMMANDER
|---------------------------------------------------------------------------
*/
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER", "BASE_COMMANDER"),
  async (req, res) => {
    try {
      let query = `
        SELECT
          t.id,
          t.product_id,
          p.name AS product_name,
          t.equipment_type,
          t.quantity,
          t.from_base AS from_base_id,
          t.to_base AS to_base_id,
          b1.name AS from_base,
          b2.name AS to_base,
          t.created_at
        FROM transfers t
        LEFT JOIN bases b1 ON b1.id = t.from_base
        LEFT JOIN bases b2 ON b2.id = t.to_base
        LEFT JOIN products p ON p.id = t.product_id
      `;

      const params = [];

      if (req.user.role === "BASE_COMMANDER") {
        query += " WHERE t.from_base = $1 OR t.to_base = $1";
        params.push(req.user.base_id);
      }

      query += " ORDER BY t.created_at DESC";

      const result = await db.query(query, params);
      return res.json(result.rows);
    } catch (err) {
      console.error("Transfer fetch error:", err);
      return res.status(500).json({
        message: "Server error while fetching transfers",
        error: err.message,
      });
    }
  }
);

module.exports = router;
























