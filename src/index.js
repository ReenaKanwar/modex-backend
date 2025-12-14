const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const busesRouter = require("./routes/buses");
const tripsRouter = require("./routes/trips");
const bookingsRouter = require("./routes/bookings");

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors());
app.use(express.json());

/* ---------------- ROUTES ---------------- */
app.use("/api/buses", busesRouter);
app.use("/api/trips", tripsRouter);
app.use("/api/bookings", bookingsRouter);

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.send("TeleBus Backend API is running 🚍");
});

/* ---------------- DB CONNECTION CHECK ---------------- */
pool
  .query("SELECT 1")
  .then(() => console.log("PostgreSQL connected ✅"))
  .catch((err) => console.error("PostgreSQL connection failed ❌", err));

/* ---------------- WORKER ---------------- */
require("./workers/expiryworker")(); 
// ⚠️ filename case should match exactly

/* ---------------- SERVER ---------------- */
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 TeleBus backend running on port ${PORT}`);
});
