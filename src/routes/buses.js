const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create bus
router.post('/', async (req, res) => {
  const { name, operator } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    const r = await pool.query('INSERT INTO buses (name, operator) VALUES ($1,$2) RETURNING *', [name, operator || null]);
    res.json(r.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// List buses
router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM buses ORDER BY id DESC');
    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
