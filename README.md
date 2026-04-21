# AutoService Pro

Auto service booking system with:

- PostgreSQL persistence
- JWT authentication
- Customer and admin roles
- Vehicles, services, bookings, notifications
- Booking status history
- Admin CRUD for services and booking statuses
- Optional email notifications for completed bookings
- Helmet, CORS and rate limiting protection

## Stack

- Backend: Node.js, Express, PostgreSQL, `pg`, `bcryptjs`, `jsonwebtoken`, `express-validator`, `helmet`, `cors`, `express-rate-limit`, `nodemailer`
- Frontend: HTML, CSS, JavaScript

## Database tables

- `users`
- `vehicles`
- `services`
- `bookings`
- `booking_status_history`
- `notifications`

## Setup

1. Copy `env.example` to `.env`
2. Create PostgreSQL database from the values in `.env`
3. Install dependencies:

```bash
npm install
```

4. Start the app:

```bash
npm run dev
```

The backend creates missing tables automatically on startup and seeds:

- initial admin user from `.env` if `ADMIN_PASSWORD` is set to a strong non-placeholder value
- base service catalog
- base product catalog

## Seeded admin

- Email comes from `ADMIN_EMAIL`
- Password comes from `ADMIN_PASSWORD`
- The admin seed is skipped when `ADMIN_PASSWORD` is missing or uses an insecure placeholder/default value

## Main API areas

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/profile`
- `GET /api/vehicles`
- `POST /api/vehicles`
- `GET /api/services`
- `POST /api/services`
- `GET /api/bookings/slots`
- `POST /api/bookings`
- `GET /api/bookings/my`
- `GET /api/admin/dashboard`
- `GET /api/admin/bookings`
- `PATCH /api/admin/bookings/:id/status`
- `GET /api/admin/products`
- `POST /api/admin/products`

## Email notifications

When a booking status changes to `completed`, the backend can send an email to the customer.

Required `.env` settings:

```env
EMAIL_NOTIFICATIONS_ENABLED=true
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-login
SMTP_PASS=your-smtp-password
SMTP_FROM=AutoService <no-reply@example.com>
```

If email notifications are disabled or SMTP settings are incomplete, booking completion still works and the server only writes a warning to the logs.

## Notes

- Booking logic blocks past time, Sunday bookings, lunch break conflicts, and double booking overlaps.
- Booking status transitions are restricted to logical steps only.
- Passwords are stored only as bcrypt hashes.
- Authentication and API endpoints are protected with rate limiting.
- Unknown routes and validation failures go through centralized error handling.
- The frontend now uses real API data instead of in-memory demo arrays.
