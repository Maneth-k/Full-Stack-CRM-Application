# Velocity CRM

A full-stack Customer Relationship Management (CRM) application built for small sales teams. Track leads across a visual Kanban pipeline, monitor revenue metrics on a live dashboard, and manage contact activity all from a sleek, dark-themed interface.

**Live Demo:** [https://full-stack-crm-application-sx7m.vercel.app/](https://full-stack-crm-application-sx7m.vercel.app/)

## Demo Video

> Click the thumbnail below to watch the full walkthrough on Google Drive.

[![Velocity CRM Demo](https://drive.google.com/thumbnail?id=1Pzkf9Versrb0vnEoLtMvkj9929GC_7cZ&sz=w1280)](https://drive.google.com/file/d/1Pzkf9Versrb0vnEoLtMvkj9929GC_7cZ/view?usp=sharing)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Deployment](#deployment)
- [How to Run Locally](#how-to-run-locally)
- [Environment Variables](#environment-variables)
- [Test Login Credentials](#test-login-credentials)
- [Database Setup](#database-setup)
- [Seeding the Database](#seeding-the-database)
- [API Endpoints](#api-endpoints)
- [Known Limitations](#known-limitations)
- [Reflection](#reflection)

---

## Project Overview

Velocity CRM is a production-style, secure CRM built with the **MERN stack** (MongoDB, Express, React, Node.js) and fully typed with **TypeScript** on both ends. It enables sales teams to:

- Manage leads across a 6-stage sales pipeline via drag-and-drop Kanban
- Drill into individual lead profiles to update status and log activity notes
- Monitor key sales metrics (pipeline value, won revenue, lead counts) from a live dashboard
- Filter and search leads by name, company, email, source, or assigned salesperson
- Automatically detect and visually flag stale leads that need follow-up
- Log common sales touch-points with a single click via canned note buttons

Authentication is handled via **cookie-based JWTs** (httpOnly, secure) so no token is ever exposed to client-side JavaScript.

---

## Tech Stack

### Backend

| Technology                              | Purpose                        |
| --------------------------------------- | ------------------------------ |
| **Node.js + Express**                   | REST API server                |
| **TypeScript**                          | Strict type safety             |
| **MongoDB + Mongoose**                  | Database & ODM                 |
| **bcryptjs**                            | Password hashing               |
| **jsonwebtoken (JWT)**                  | Auth token generation          |
| **cookie-parser**                       | Reading httpOnly cookies       |
| **cors**                                | Cross-origin request handling  |
| **@upstash/ratelimit + @upstash/redis** | Redis-backed API rate limiting |
| **nodemon**                             | Dev auto-reload                |

### Frontend

| Technology                     | Purpose                              |
| ------------------------------ | ------------------------------------ |
| **React 19 + Vite**            | UI framework & build tool            |
| **TypeScript**                 | Type-safe components                 |
| **Tailwind CSS v4**            | Utility-first styling                |
| **React Router v7**            | Client-side routing                  |
| **Axios**                      | HTTP client (with `withCredentials`) |
| **@dnd-kit**                   | Drag-and-drop Kanban board           |
| **Chart.js + react-chartjs-2** | Dashboard analytics charts           |
| **react-hot-toast**            | Toast notifications                  |
| **lucide-react**               | Icon library                         |

---

## Features

### Authentication

- Secure login with email and password
- JWT stored in an `httpOnly` cookie never accessible from JavaScript
- Session persistence via `GET /api/auth/me` on page load
- Protected routes with automatic redirect to `/login`
- One-click logout that clears the server-side cookie

### Dashboard

- Live metrics: Total Leads, New Leads, Qualified Leads, Won Leads, Lost Leads
- Pipeline Value: sum of all active (non-Won/Lost) deal values
- Total Revenue: sum of Won deal values only
- Interactive bar chart showing lead distribution by status
- **Drill-down modals**: clicking any metric card opens a filtered lead list with direct links to lead profiles

### Kanban Board (Lead Management)

- Six-column pipeline: `New → Contacted → Qualified → Proposal Sent → Won → Lost`
- **Drag-and-drop** to move leads between stages (powered by @dnd-kit)
- Optimistic UI updates the board updates instantly; rolls back on API failure
- **Search**: real-time debounced search across name, company, and email
- **Filter by Source**: Website, LinkedIn, Referral, Cold Email, Event
- **Filter by Assigned Salesperson**: dynamic dropdown populated from the user list
- Add new leads via a floating action button (FAB) modal form
- Edit existing leads inline via the same modal
- Delete leads with a confirmation prompt

### Lead Detail View

- Visual progress tracker showing the lead's current stage in the pipeline
- Full lead info: company, contact details, source, deal value, creation date
- Inline status change via dropdown
- **Notes / Activity Log**: timestamped internal notes per lead, showing the author's email

### Stale Lead Detection

- Any lead in an active pipeline stage (`Contacted`, `Qualified`, or `Proposal Sent`) that has **not had a note added in the last 5 days** is automatically flagged
- The Kanban card receives a **glowing red border**
- A **"Needs Follow-up"** badge is rendered at the top of the card so it stands out at a glance
- The stale timer **resets automatically** when any note (including a canned note) is added the backend updates `lead.updatedAt` on every `POST /api/leads/:id/notes` request
- Leads with status `New`, `Won`, or `Lost` are intentionally excluded from this check

### One-Click Canned Notes

- Three pill-shaped quick-action buttons are displayed directly above the "Add Note" text area on the Lead Detail page
- Available options: **Left Voicemail**, **Sent Pricing**, **Follow up next week**
- Clicking a button immediately fires a POST request and submits the note. No typing required
- The note list refreshes instantly after submission and the lead's `updatedAt` timestamp is reset, clearing any active stale warning

### Security

- Passwords hashed with bcryptjs (salt rounds: 10)
- JWT verified on every protected route via `protect` middleware
- CORS locked to the configured frontend URL only
- `httpOnly` + `secure` + `SameSite=None` cookies for cross-origin deployments
- **Rate limiting** on API routes via [Upstash Redis](https://upstash.com/) limits each IP to a configurable number of requests per window to prevent abuse and brute-force attacks

---

## Deployment

The application is deployed across two platforms:

| Layer           | Platform | URL                                                                                                                          |
| --------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**    | Vercel   | [https://full-stack-crm-application-sx7m.vercel.app/](https://full-stack-crm-application-sx7m.vercel.app/)                   |
| **Backend API** | Railway  | [https://full-stack-crm-application-production.up.railway.app](https://full-stack-crm-application-production.up.railway.app) |

### Frontend (Vercel)

- Deployed automatically from the `frontend/` directory
- Set the `VITE_BACKEND_URL` environment variable in the Vercel project settings to point to the Railway backend URL:
  ```
  VITE_BACKEND_URL=https://full-stack-crm-application-production.up.railway.app/api
  ```

### Backend (Railway)

- Deployed from the `backend/` directory
- Configure the following environment variables in the Railway project settings:

| Variable                   | Value                                                |
| -------------------------- | ---------------------------------------------------- |
| `PORT`                     | `5000` (Railway may override this automatically)     |
| `MONGODB_URI`              | Your MongoDB Atlas connection string                 |
| `JWT_SECRET`               | A strong, random secret key                          |
| `FRONTEND_URL`             | `https://full-stack-crm-application-sx7m.vercel.app` |
| `UPSTASH_REDIS_REST_URL`   | Your Upstash Redis REST URL (optional)               |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash Redis token (optional)                  |

---

## How to Run Locally

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally **or** a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI

### 1. Clone the repository

```bash
git clone https://github.com/Maneth-k/Full-Stack-CRM-Application.git
cd "Torch labs"
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create your `.env` file (see [Environment Variables](#environment-variables) below):

```bash
MONGODB_URI=`mongodb://localhost:27017/crm`
PORT=5000
JWT_SECRET=`super_secret_123`
FRONTEND_URL=`http://localhost:5173`
```

### Optional: Redis Caching (Upstash)

This project implements a Redis caching layer to optimize the Dashboard metrics API.

If you do not provide these variables, the application will **gracefully fall back** to querying the MongoDB database directly. To test the caching layer locally, you can create a free Redis database at [Upstash](https://upstash.com/).

| Variable                   | Description                 | Example                                   |
| :------------------------- | :-------------------------- | :---------------------------------------- |
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis REST endpoint | `https://logical-donkey-12345.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST Token          | `AXcASdasd...`                            |

```bash
npm run dev
```

The backend will start on **http://localhost:5000**.  
On first boot, it automatically seeds an admin user if one doesn't already exist.

### 3. Set up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_BACKEND_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

The frontend will start on **http://localhost:5173**.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                   | Description                                                 | Example                         |
| -------------------------- | ----------------------------------------------------------- | ------------------------------- |
| `PORT`                     | Port the Express server listens on                          | `5000`                          |
| `MONGODB_URI`              | MongoDB connection string                                   | `mongodb://localhost:27017/crm` |
| `JWT_SECRET`               | Secret key for signing JWTs — **change this in production** | `your_super_secret_jwt_key`     |
| `FRONTEND_URL`             | Allowed CORS origin                                         | `http://localhost:5173`         |
| `UPSTASH_REDIS_REST_URL`   | REST URL from your Upstash Redis database                   | `https://xxxx.upstash.io`       |
| `UPSTASH_REDIS_REST_TOKEN` | Auth token from your Upstash Redis database                 | `AXxx...`                       |

> **Note:** The `UPSTASH_*` variables are required for the rate limiter. Create a free database at [console.upstash.com](https://console.upstash.com) and copy the REST URL and token from the dashboard.

### Frontend (`frontend/.env`)

| Variable           | Description                  | Example                     |
| ------------------ | ---------------------------- | --------------------------- |
| `VITE_BACKEND_URL` | Base URL for the backend API | `http://localhost:5000/api` |

> **Note:** If `VITE_BACKEND_URL` is not set, the Axios client defaults to `http://localhost:5000/api`.

---

## Test Login Credentials

The backend automatically seeds a default admin user on startup if it doesn't already exist:

| Field        | Value               |
| ------------ | ------------------- |
| **Email**    | `admin@example.com` |
| **Password** | `password123`       |
| **Role**     | `admin`             |

> You can create additional users directly in the MongoDB database if needed.

---

## Database Setup

This app uses **MongoDB**. No manual schema migration is needed — Mongoose handles collection creation automatically.

### Option A: Local MongoDB

1. Install and start MongoDB Community Edition
2. Set `MONGODB_URI=mongodb://localhost:27017/crm` in `backend/.env`
3. The `crm` database and all collections will be created on first run

### Option B: MongoDB Atlas (Cloud)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist your IP address
3. Copy the connection string and set it as `MONGODB_URI` in `backend/.env`:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/crm?retryWrites=true&w=majority
```

### Collections Created Automatically

| Collection | Description                                                     |
| ---------- | --------------------------------------------------------------- |
| `users`    | Salesperson accounts (email, hashed password, role)             |
| `leads`    | Lead records with status, source, deal value, and assigned user |
| `notes`    | Activity notes linked to a lead and the user who created them   |

---

## Seeding the Database

A seed script is included to populate the database with **50 realistic fake leads** for development and demo purposes. Leads are generated with a randomised mix of statuses, sources, deal values, and `updatedAt` timestamps — roughly half will be "stale" (older than 5 days) so the Stale Lead Detection feature is immediately visible.

> **Prerequisites:** Run `npm run dev` at least once first so the admin user is auto-seeded into the `users` collection.

```bash
cd backend
npx ts-node src/seed.ts
```

This script:

1. Clears all existing leads from the database
2. Fetches all existing user IDs to assign leads to
3. Inserts 50 fake leads with realistic data via `faker-js`
4. Bypasses Mongoose's auto-timestamp to preserve the fake `updatedAt` dates

> **Note:** `src/seed.ts` is listed in `.gitignore` and will not be committed to version control.

---

## 📡 API Endpoints

All protected routes require a valid JWT cookie (set automatically after login).

| Method   | Endpoint               | Auth | Description                                                            |
| -------- | ---------------------- | ---- | ---------------------------------------------------------------------- |
| `POST`   | `/api/auth/login`      | ❌   | Login sets httpOnly JWT cookie                                         |
| `POST`   | `/api/auth/logout`     | ❌   | Logout clears cookie                                                   |
| `GET`    | `/api/auth/me`         | ✅   | Returns current user profile                                           |
| `GET`    | `/api/auth/users`      | ✅   | Lists all users (for salesperson filter)                               |
| `GET`    | `/api/leads`           | ✅   | List leads supports `?search=`, `?status=`, `?source=`, `?assignedTo=` |
| `POST`   | `/api/leads`           | ✅   | Create a new lead                                                      |
| `GET`    | `/api/leads/:id`       | ✅   | Get a single lead by ID                                                |
| `PUT`    | `/api/leads/:id`       | ✅   | Update a lead                                                          |
| `DELETE` | `/api/leads/:id`       | ✅   | Delete a lead                                                          |
| `GET`    | `/api/leads/:id/notes` | ✅   | Get all notes for a lead                                               |
| `POST`   | `/api/leads/:id/notes` | ✅   | Add a note to a lead                                                   |
| `GET`    | `/api/dashboard/stats` | ✅   | Aggregated dashboard metrics                                           |

---

## Known Limitations

- **No role-based access control (RBAC) enforced on routes**: all authenticated users can edit or delete any lead regardless of who it's assigned to. Role checks exist in the data model but not in the API middleware.
- **No email uniqueness enforced at creation**: the User schema enforces unique emails via Mongoose, but there is no user registration UI — users can only be added directly to the database.
- **No pagination**: the leads list endpoint returns all matching leads at once. This may become slow with very large datasets.
- **Single user seeded**: the app seeds only one default admin. Additional test users must be inserted manually into MongoDB.
- **No note deletion or editing**: notes are append-only once added to a lead.
- **Status progression is not enforced server-side**: a lead can be moved from `New` directly to `Won` without going through intermediate stages — the pipeline stages are visual only.
- **No file/attachment support**: the notes system only supports plain text.
- **Cookie `SameSite=None` requires HTTPS in production**: the current cookie config works for cross-origin deployments (e.g., Vercel frontend + Render backend) but requires both services to be served over HTTPS.

---

## Reflection

This project was built as a learning exercise in full-stack TypeScript development with a focus on security, clean architecture, and real-world patterns.

**What went well:**

- Cookie-based JWT auth is a more secure pattern than localStorage tokens, and implementing it end-to-end (Express → httpOnly cookie → Axios `withCredentials`) was a valuable experience.
- The drag-and-drop Kanban with optimistic UI updates gives the app a genuinely responsive feel — the `@dnd-kit` library made this achievable without heavy boilerplate.
- Using Mongoose aggregation pipelines for the dashboard kept the analytics logic on the database tier where it belongs, rather than pulling all records and computing in Node.js.
- The debounced search with server-side filtering keeps the API efficient and avoids client-side filtering of potentially large datasets.
- **Stale Lead Detection** is a clean example of pure client-side date math paired with a backend side-effect (touching `updatedAt` on note creation) to create a self-resetting workflow automation — no cron jobs or extra DB queries required.
- Integrating **Upstash** for rate limiting was straightforward and avoids the need to run a local Redis instance, keeping the dev environment simple.

**What could be improved:**

- **Testing**: the project has no automated test suite (unit or integration). Adding Jest + Supertest for the API and Vitest + React Testing Library for the UI would significantly improve confidence in the codebase.
- **RBAC**: enforcing role-based permissions at the middleware level (e.g., only admins can delete leads, sales reps can only see their own) would make this production-ready.
- **Error handling**: error responses from the API are functional but not standardised. A consistent error envelope format (e.g., `{ success, message, errors }`) would make frontend handling cleaner.
- **Pagination & sorting**: for a real sales team with hundreds of leads, server-side pagination is essential.
- **Deployment automation**: the frontend is configured for Vercel (`vercel.json`) but the backend deployment pipeline (e.g., Render, Railway) is not documented or automated.
- **Canned notes extensibility**: the three canned note options are currently hard-coded in the component. A future improvement would be to make them configurable per user or organisation via a settings page.
