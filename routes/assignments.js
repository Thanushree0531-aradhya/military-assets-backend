const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const db = require('../db');

// POST /api/assignments
router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'LOGISTICS_OFFICER']),
  async (req, res) => {
    try {
      const { equipmentType, quantity, assignedTo, reason } = req.body;
      const baseId = parseInt(req.body.baseId, 10);

      if (!baseId || !equipmentType || !quantity || !assignedTo || !reason) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be a positive number' });
      }

      await db.query(
        `INSERT INTO assignments 
         (base_id, equipment_type, quantity, assigned_to, reason)
         VALUES ($1,$2,$3,$4,$5)`,
        [baseId, equipmentType, quantity, assignedTo, reason]
      );

      res.json({ message: 'Assignment recorded successfully' });
    } catch (err) {
      console.error('Assignment error:', err);
      res.status(500).json({ message: 'Server error while recording assignment' });
    }
  }
);

// GET /api/assignments
router.get(
  '/',
  authenticate,
  authorize(['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER']),
  async (req, res) => {
    try {
      const result = await db.query(`
        SELECT 
          a.id,
          b.name AS base_name,
          a.equipment_type,
          a.quantity,
          a.assigned_to,
          a.reason,
          a.created_at
        FROM assignments a
        JOIN bases b ON a.base_id = b.id
        ORDER BY a.created_at DESC
      `);

      res.json(result.rows);
    } catch (err) {
      console.error('Get assignments error:', err.message);
      res.status(500).json({ message: 'Server error while fetching assignments' });
    }
  }
);

module.exports = router;
