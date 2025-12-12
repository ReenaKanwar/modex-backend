const axios = require('axios');
const API = process.env.API || 'http://localhost:4000/api';
const TRIP_ID = process.env.TRIP_ID || 1;
const SEAT_ID = process.env.SEAT_ID || 1;

async function bookSingle(i) {
  try {
    const resp = await axios.post(`${API}/bookings`, {
      trip_id: TRIP_ID,
      seat_ids: [parseInt(SEAT_ID, 10)],
      user_name: `User${i}`,
      user_phone: '9999999999'
    }, { timeout: 10000 });
    console.log(i, '->', resp.data);
  } catch (err) {
    if (err.response) console.log(i, 'ERR', err.response.status, err.response.data);
    else console.log(i, 'ERR', err.message);
  }
}

async function runParallel(n = 20) {
  const promises = [];
  for (let i = 0; i < n; i++) promises.push(bookSingle(i));
  await Promise.all(promises);
  console.log('done');
}

runParallel(25);
