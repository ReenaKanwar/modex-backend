const express = require('express');
const router = express.Router();
const pool = require('../db');

// Book seats: body { trip_id, seat_ids: [], user_name, user_phone }
router.post('/', async (req, res) => {
  const { trip_id, seat_ids, user_name, user_phone } = req.body;
  if (!trip_id || !seat_ids || seat_ids.length === 0 || !user_name) {
    return res.status(400).json({ error: 'missing fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const created = [];
    for (const seatId of seat_ids) {
      // lock seat row
      const seatRes = await client.query('SELECT * FROM seats WHERE id=$1 FOR UPDATE', [seatId]);
      if (seatRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `seat ${seatId} not found` });
      }
      const seat = seatRes.rows[0];
      if (seat.is_booked) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: `seat ${seat.seat_number} already booked` });
      }

      const bRes = await client.query(
        'INSERT INTO bookings (trip_id, seat_id, user_name, user_phone, status) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [trip_id, seatId, user_name, user_phone || null, 'PENDING']
      );

      // reserve seat
      await client.query('UPDATE seats SET is_booked = true WHERE id = $1', [seatId]);

      created.push(bRes.rows[0]);
    }

    await client.query('COMMIT');

    // Demo: immediately confirm bookings (simulate payment success)
    for (const b of created) {
      await pool.query('UPDATE bookings SET status=$1 WHERE id=$2', ['CONFIRMED', b.id]);
    }

    const bookings = created.map(b => ({ ...b, status: 'CONFIRMED' }));
    res.json({ success: true, bookings });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('booking error', e);
    res.status(500).json({ error: 'server error' });
  } finally {
    client.release();
  }
});

// Get booking by id
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM bookings WHERE id=$1', [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json(r.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
