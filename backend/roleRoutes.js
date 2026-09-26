const express = require('express');
const router = express.Router();
const db = require('./db');

// Get all users (admin view)
router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, password, role, name, profile_id as profileId, license FROM users');
    res.json(rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user roles view
router.get('/roles', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM user_roles');
    res.json(rows);
  } catch (err) {
    console.error('Get roles error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Change user role via stored procedure
router.post('/change-role', async (req, res) => {
  const { userId, newRole, changedBy } = req.body;
  if (!userId || !newRole) {
    return res.status(400).json({ error: 'userId and newRole required' });
  }
  try {
    await db.query('CALL sp_change_user_role(?, ?, ?)', [userId, newRole, changedBy || null]);
    res.json({ message: `User ${userId} role changed to ${newRole}` });
  } catch (err) {
    console.error('Change role error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
