const pool = require('../db');

async function seed() {
  try {
    await pool.query('BEGIN');
    const bus1 = (await pool.query('INSERT INTO buses (name, operator) VALUES ($1,$2) RETURNING *', ['Volvo AC', 'FastLines'])).rows[0];

    const trip1 = (await pool.query(
      'INSERT INTO trips (bus_id, start_time, from_city, to_city, total_seats) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [bus1.id, new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), 'Delhi', 'Jaipur', 40]
    )).rows[0];

    await pool.query('INSERT INTO seats (trip_id, seat_number) SELECT $1, generate_series(1,$2)', [trip1.id, trip1.total_seats]);

    await pool.query('COMMIT');
    console.log('Seeded. Trip id:', trip1.id);
    process.exit(0);
  } catch (e) {
    await pool.query('ROLLBACK');
    console.error(e);
    process.exit(1);
  }
}

seed();
