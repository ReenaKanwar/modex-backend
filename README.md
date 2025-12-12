# TeleBus Backend (Postgres + Node)

1. Install Postgres, create DB:
   - create database `bus_booking`
   - Example psql:
     psql -U postgres
     CREATE DATABASE bus_booking;

2. Copy .env.example -> .env and set DATABASE_URL:
   DATABASE_URL=postgres://bus_booking:kanwar@localhost:5432/bus_booking

3. Install deps:
   npm install

4. Run migrations:
   npm run migrate

5. Seed sample data:
   npm run seed

6. Start server (dev):
   npm run dev

7. Test APIs:
   GET  /api/trips
   GET  /api/trips/:id/seats
   POST /api/bookings  body: { trip_id, seat_ids:[...], user_name, user_phone }

8. Concurrency test:
   npm run test:concurrency (or run node src/scripts/concurrency-test.js)
