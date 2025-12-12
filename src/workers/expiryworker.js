const pool = require('../db');

module.exports = function startExpiryWorker() {
  async function expirePending() {
    try {
      const { rows } = await pool.query(
        `SELECT id FROM bookings WHERE status='PENDING' AND created_at <= now() - interval '2 minutes'`
      );
      for (const r of rows) {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          // lock booking row and get seat id
          const bk = await client.query('SELECT seat_id FROM bookings WHERE id=$1 FOR UPDATE', [r.id]);
          if (bk.rowCount === 0) { await client.query('ROLLBACK'); client.release(); continue; }
          const seatId = bk.rows[0].seat_id;

          // update booking and free seat
          await client.query('UPDATE bookings SET status=$1 WHERE id=$2', ['FAILED', r.id]);
          await client.query('UPDATE seats SET is_booked=false WHERE id=$1', [seatId]);

          await client.query('COMMIT');
          console.log('Expired booking', r.id);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error('expiry worker error', err);
        } finally {
          client.release();
        }
      }
    } catch (err) {
      console.error('expiry worker select error', err);
    }
  }

  // run every 30 seconds
  setInterval(expirePending, 30 * 1000);
};
