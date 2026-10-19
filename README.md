# Mapple View Resort

A resort booking site built with Next.js (App Router), TypeScript, Tailwind CSS, and SQLite (via the built-in `node:sqlite` module).

## Features

- **Public site** — home, rooms listing, room detail, about, contact.
- **Booking flow** — a guest picks dates and submits a booking request, then lands on a confirmation page with:
  - A UPI QR code (and deep link) to pay, built from the resort's UPI ID in Settings.
  - A WhatsApp link pre-filled with the booking details, so the guest can notify the owner directly (there's no WhatsApp Business API integration here — this uses a `wa.me` click-to-chat link instead, which needs no credentials).
- **Admin panel** (`/admin`) — cookie-session-protected:
  - Rooms: create, edit, delete (rooms with existing bookings can't be deleted — deactivate them instead).
  - Bookings: view all requests and update their status (pending / confirmed / cancelled).
  - Settings: hotel name, tagline, address, owner WhatsApp number, UPI ID/payee name, contact email, about text.

## Getting started

```bash
npm install
cp .env.example .env.local   # set SESSION_SECRET (openssl rand -base64 32)
npm run dev
```

The SQLite database is created automatically at `data/mapple-view.db` on first run, seeded with sample rooms and a default admin user:

- **Username:** `admin`
- **Password:** `changeme123`

Change this password (or add a new admin user) directly in the database before deploying anywhere public — there's no in-app "change password" flow yet.

## Tech notes

- Auth: a signed (HS256/JWT via `jose`) `httpOnly` cookie session, checked in `src/proxy.ts` (Next.js 16 renamed `middleware.ts` to `proxy.ts`) and again in the admin layout/server actions.
- Data: `node:sqlite` (`DatabaseSync`), no native build step required. Schema + seed data live in `src/lib/db.ts`.
- Server Actions (`src/lib/actions/*`) handle all mutations (login, bookings, room CRUD, settings).

## Build

```bash
npm run build
npm start
```
