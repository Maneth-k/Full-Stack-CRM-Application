# CRM Application: Technical Implementation & Mongoose Schemas

## 1. Tech Stack Definition
*   **Language:** TypeScript (Strict mode enabled for both Client and Server).
*   **Frontend:** React (Vite), Tailwind CSS, React Router, Axios.
*   **Backend:** Node.js, Express, `cookie-parser`, JWT, bcryptjs.
*   **Database:** MongoDB via Mongoose.

## 2. Server Configuration (Crucial for Cookies)
To allow cookies to be passed between the frontend and backend (especially if running on different ports locally, e.g., 5173 and 3000):
*   **Express CORS:** Must be configured with `credentials: true` and the specific `origin` of the frontend.
*   **Cookie Parser:** Use the `cookie-parser` middleware to read incoming cookies.
*   **Token Setting Example:** `res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 3600000 });`

## 3. Mongoose Schemas (TypeScript)
Use Mongoose with TypeScript interfaces for strong typing.

**User Schema:**
*   `email`: String, required, unique.
*   `password`: String, required (hashed).
*   `role`: String, default 'sales'.

**Lead Schema:**
*   `name`: String, required.
*   `company`: String, required.
*   `email`: String.
*   `phone`: String.
*   `source`: String (Enum: 'Website', 'LinkedIn', 'Referral', 'Cold Email', 'Event').
*   `status`: String (Enum: 'New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'), default 'New'.
*   `dealValue`: Number, default 0.
*   `assignedTo`: ObjectId (ref: 'User').
*   `timestamps`: true (createdAt, updatedAt).

**Note Schema:**
*   `content`: String, required.
*   `leadId`: ObjectId (ref: 'Lead'), required.
*   `createdBy`: ObjectId (ref: 'User'), required.
*   `timestamps`: true.

## 4. Frontend Configuration (Axios & Types)
*   **Axios:** Create an Axios instance where `withCredentials: true` is set globally so the browser automatically sends the `httpOnly` cookie with every API request.
*   **Types:** Define distinct TypeScript interfaces for `ILead`, `INote`, and `IUser` that mirror the Mongoose schemas so the React components know exactly what props to expect.
*   **Auth State:** Create a React Context (`AuthContext`) that checks an endpoint (e.g., `GET /api/auth/me`) on initial load. If it returns 200, the user is logged in. If 401, redirect to `/login`.

## 5. API Endpoints Contract
*   `POST /api/auth/login` (Sets cookie)
*   `POST /api/auth/logout` (Clears cookie)
*   `GET /api/auth/me` (Validates cookie, returns user profile)
*   `GET /api/leads` (Supports `?search=` and `?status=` queries)
*   `POST /api/leads`
*   `PUT /api/leads/:id`
*   `GET /api/leads/:id/notes`
*   `POST /api/leads/:id/notes`
*   `GET /api/dashboard/stats` (Uses Mongoose aggregation pipeline)