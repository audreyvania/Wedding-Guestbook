# Wedding Guestbook

Wedding Guestbook now runs on a React + Vite frontend and an Express (Node.js) backend. The existing interface, MySQL data, guest workflow, QR scan, exports, and role access are preserved.

## Requirements

- Node.js 20+
- MySQL / Laragon MySQL running

## Setup

1. Copy `.env.example` to `.env` and set the MySQL credentials.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the Vite address shown in the terminal, normally `http://localhost:5173`.

The Node server creates `users` and `tamu_undangan` only when absent. Existing records are not replaced. Initial admin and receptionist accounts are created only if their emails are not already in the database.

For production on a regular Node host, run `npm run build`, then `npm start`. The app runs on `http://localhost:3000` by default.

## Environment

Use `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` for MySQL. `ADMIN_*` and `RECEPTIONIST_*` provide the initial account values. Set a private, random `SESSION_SECRET` before deployment.

## Deploy to Netlify

This repository includes `netlify.toml` and a Netlify Function for the Express API. Netlify builds the React application to `dist` and forwards `/api/*`, `/login`, and `/logout` to that Function.

1. Push the repository to GitHub and create a new Netlify site from it.
2. Netlify automatically reads `netlify.toml`; do not set a PHP/Composer build command.
3. In **Site configuration → Environment variables**, add these values from a hosted MySQL provider:

   - `DB_HOST`
   - `DB_PORT` (usually `3306`)
   - `DB_DATABASE`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `SESSION_SECRET` (a long random string)
   - Optional: `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `RECEPTIONIST_NAME`, `RECEPTIONIST_EMAIL`, `RECEPTIONIST_PASSWORD`

Do not use `127.0.0.1`, `localhost`, or Laragon credentials on Netlify: they refer to Netlify's own isolated environment. The MySQL server must allow incoming TLS/network connections from Netlify.
