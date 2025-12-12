const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create trip and seats
router.post('/', async (req, res) => {
  const { bus_id, start_time, from_city, to_city, total_seats } = req.body;
  if (!bus_id || !start_time || !total_seats || !from_city || !to_city) {
    return res.status(400).json({ error: 'missing fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tripRes = await client.query(
      'INSERT INTO trips (bus_id, start_time, from_city, to_city, total_seats) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [bus_id, start_time, from_city, to_city, total_seats]
    );
    const trip = tripRes.rows[0];

    // bulk insert seats using generate_series
    await client.query(
      `INSERT INTO seats (trip_id, seat_number)
       SELECT $1, generate_series(1, $2);`,
      [trip.id, total_seats]
    );

    await client.query('COMMIT');
    res.json(trip);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'server error' });
  } finally {
    client.release();
  }
});

// List trips (with bus info)
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`SELECT t.*, b.name as bus_name, b.operator
      FROM trips t JOIN buses b ON b.id = t.bus_id
      ORDER BY t.start_time`);
    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// Get seats for a trip
router.get('/:id/seats', async (req, res) => {
  const tripId = req.params.id;
  try {
    const r = await pool.query('SELECT id, seat_number, is_booked FROM seats WHERE trip_id=$1 ORDER BY seat_number', [tripId]);
    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
