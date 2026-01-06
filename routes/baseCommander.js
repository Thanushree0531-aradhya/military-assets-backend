// routes/baseCommander.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const db = require('../db');

// =====================
// Get assets for the logged-in Base Commander
// =====================
router.get('/assets', authenticate, authorize(['BASE_COMMANDER']), async (req, res) => {
  try {
    // ✅ Get base_id directly from JWT
    const base_id = req.user?.base_id;

    if (!base_id) {
      return res.status(400).json({ message: 'Base ID not found in token', assets: [] });
    }

    // Fetch assets for this base
    const result = await db.query(
      'SELECT * FROM purchases WHERE base_id=$1 ORDER BY created_at DESC',
      [base_id]
    );

    if (result.rows.length === 0) {
      return res.json({ assets: [], message: 'No assets found for your base' });
    }

    res.json({ assets: result.rows });
  } catch (err) {
    console.error('Base Commander assets error:', err.message);
    res.status(500).json({ message: 'Server error while fetching base assets', assets: [] });
  }
});

// =====================
// Optional: fetch assets for a specific base ID
// Useful if you need to fetch other bases (e.g., admin view)
// =====================
router.get('/assets/:baseId', authenticate, authorize(['BASE_COMMANDER']), async (req, res) => {
  try {
    const { baseId } = req.params;

    if (!baseId) {
      return res.status(400).json({ message: 'Base ID is required', assets: [] });
    }

    // Fetch assets for the requested base ID
    const result = await db.query(
      'SELECT * FROM purchases WHERE base_id=$1 ORDER BY created_at DESC',
      [baseId]
    );

    if (result.rows.length === 0) {
      return res.json({ assets: [], message: 'No assets found for this base' });
    }

    res.json({ assets: result.rows });
  } catch (err) {
    console.error('Base Commander assets by ID error:', err.message);
    res.status(500).json({ message: 'Server error while fetching assets by base ID', assets: [] });
  }
});

module.exports = router;






