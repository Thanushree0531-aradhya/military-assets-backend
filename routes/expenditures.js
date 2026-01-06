// routes/expenditures.js
const express = require("express");
const router = express.Router();
const pool = require("../db"); // PostgreSQL pool

// -------------------- GET all expenditures --------------------
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id, b.name AS base_name, e.equipment_type, e.quantity, e.assigned_to, e.reason, e.created_at
      FROM expenditures e
      JOIN bases b ON e.base_id = b.id
      ORDER BY e.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch expenditures:", err.message);
    res.status(500).json({ message: "Failed to fetch expenditures" });
  }
});

// -------------------- POST a new expenditure --------------------
router.post("/", async (req, res) => {
  try {
    let { baseId, equipmentType, quantity, assignedTo, reason } = req.body;

    // Convert to proper types
    baseId = parseInt(baseId);
    quantity = parseInt(quantity);

    // Validate required fields (assignedTo is optional)
    if (!baseId || !equipmentType || !quantity || !reason) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Default assignedTo to null if not provided
    assignedTo = assignedTo || null;

    const result = await pool.query(
      `INSERT INTO expenditures (base_id, equipment_type, quantity, assigned_to, reason)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [baseId, equipmentType, quantity, assignedTo, reason]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error saving expenditure:", err.message);
    res.status(500).json({ message: "Error saving expenditure" });
  }
});

// -------------------- PUT (edit) an expenditure --------------------
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let { baseId, equipmentType, quantity, assignedTo, reason } = req.body;

    // Convert to proper types
    baseId = parseInt(baseId);
    quantity = parseInt(quantity);

    // Validate required fields (assignedTo is optional)
    if (!baseId || !equipmentType || !quantity || !reason) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Default assignedTo to null if not provided
    assignedTo = assignedTo || null;

    const result = await pool.query(
      `UPDATE expenditures 
       SET base_id=$1, equipment_type=$2, quantity=$3, assigned_to=$4, reason=$5
       WHERE id=$6
       RETURNING *`,
      [baseId, equipmentType, quantity, assignedTo, reason, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Expenditure not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating expenditure:", err.message);
    res.status(500).json({ message: "Error updating expenditure" });
  }
});

module.exports = router;


