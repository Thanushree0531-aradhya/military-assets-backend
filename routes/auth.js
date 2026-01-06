const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); // your DB config

const router = express.Router();

/* ===================== SIGNUP ===================== */
router.post('/signup', async (req, res) => {
  try {
    let { name, email, password, role, rank, base_id } = req.body;

    // 1️⃣ Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    // Trim and normalize inputs
    name = name.trim();
    email = email.trim().toLowerCase();
    password = password.trim();
    rank = rank || null;
    base_id = base_id || null;

    // 2️⃣ Email validation
    if (!email.includes('@gmail.com')) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // 3️⃣ Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
      });
    }

    // 4️⃣ Check if user already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // 5️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6️⃣ Insert user
    await db.query(
      `INSERT INTO users (name, email, password, role, rank, base_id)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [name, email, hashedPassword, role, rank, base_id]
    );

    res.status(201).json({ message: 'Signup successful. Please login.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

/* ===================== LOGIN ===================== */
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    email = email.trim().toLowerCase();
    password = password.trim();

    // 1️⃣ Get user from DB
    const userRes = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = userRes.rows[0];

    // 2️⃣ Compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3️⃣ Generate JWT including base_id
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        base_id: user.base_id || null // ✅ ensure base_id is always included
      },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '1d' }
    );

    // 4️⃣ Send token, role, and base_id to frontend
    res.json({
      message: 'Login successful',
      token,
      role: user.role,
      base_id: user.base_id || null
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;







