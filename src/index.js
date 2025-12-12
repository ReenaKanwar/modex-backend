const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db'); // ensures DB module loads
const busesRouter = require('./routes/buses');
const tripsRouter = require('./routes/buses');
const bookingsRouter = require('./routes/bookings');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/buses', busesRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/bookings', bookingsRouter);

// start expiry worker (marks old PENDING as FAILED)
require('../workers/expiryWorker')();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`TeleBus backend running on ${PORT}`));
