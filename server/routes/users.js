const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// GET /api/users/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, experience_level, created_at FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      experienceLevel: user.experience_level,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// PATCH /api/users/me
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const { role, experienceLevel } = req.body;

    const result = await pool.query(
      `UPDATE users SET role = COALESCE($1, role), experience_level = COALESCE($2, experience_level)
       WHERE id = $3
       RETURNING id, name, email, role, experience_level, created_at`,
      [role, experienceLevel, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      experienceLevel: user.experience_level,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
