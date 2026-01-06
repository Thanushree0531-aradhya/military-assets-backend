const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const db = require('../db');

// ===================== ADD A PURCHASE =====================
// Only ADMIN and LOGISTICS_OFFICER can add purchases
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'LOGISTICS_OFFICER'),
  async (req, res) => {
    try {
      const { baseId, equipmentType, quantity } = req.body;

      // Validation
      if (!baseId || !equipmentType || !quantity) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be a positive number' });
      }

      const result = await db.query(
        `
        INSERT INTO purchases (base_id, equipment_type, quantity, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING
          id,
          base_id,
          equipment_type,
          equipment_type AS asset_name,
          quantity,
          created_at,
          to_char(created_at, 'DD/MM/YYYY, HH12:MI:SS AM') AS date
        `,
        [baseId, equipmentType, quantity]
      );

      res.json({
        message: 'Purchase recorded successfully',
        purchase: result.rows[0],
      });
    } catch (err) {
      console.error('Purchase error:', err.message);
      res.status(500).json({ message: 'Server error while recording purchase' });
    }
  }
);

// ===================== GET ALL PURCHASES WITH TRANSFERS =====================
// ADMIN: all purchases
// LOGISTICS_OFFICER: all bases
// BASE_COMMANDER: only their base
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER'),
  async (req, res) => {
    try {
      let query = `
        SELECT 
          p.id,
          p.equipment_type,
          p.equipment_type AS asset_name,
          p.quantity,
          p.created_at,
          to_char(p.created_at, 'DD/MM/YYYY, HH12:MI:SS AM') AS date,
          b.name AS base_name,
          p.base_id,
          -- Transfer in for Net Movement
          COALESCE(
            (SELECT SUM(t.quantity) FROM transfers t
             WHERE t.to_base = p.base_id AND t.equipment_type = p.equipment_type), 0
          ) AS transfer_in,
          -- Transfer out for Net Movement
          COALESCE(
            (SELECT SUM(t.quantity) FROM transfers t
             WHERE t.from_base = p.base_id AND t.equipment_type = p.equipment_type), 0
          ) AS transfer_out
        FROM purchases p
        JOIN bases b ON p.base_id = b.id
      `;

      const params = [];

      // BASE_COMMANDER sees only their base
      if (req.user.role === 'BASE_COMMANDER') {
        query += ' WHERE p.base_id = $1';
        params.push(req.user.base_id);
      }

      query += ' ORDER BY p.created_at DESC';

      const result = await db.query(query, params);

      // Normalize numeric values for frontend
      const normalized = result.rows.map((r) => ({
        ...r,
        quantity: Number(r.quantity),
        transfer_in: Number(r.transfer_in),
        transfer_out: Number(r.transfer_out),
      }));

      res.json(normalized);
    } catch (err) {
      console.error('Get purchases error:', err.message);
      res.status(500).json({ message: 'Server error while fetching purchases' });
    }
  }
);

module.exports = router;














