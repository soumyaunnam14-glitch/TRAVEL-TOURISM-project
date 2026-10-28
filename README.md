# Travel Tourism

A beginner-friendly full-stack travel discovery and trip-enquiry web application built with HTML, CSS, Vanilla JavaScript, Node.js, Express.js and Supabase PostgreSQL.

## 1. Project overview

Travel Tourism helps visitors explore sample destinations, search and filter by experience, and submit a trip enquiry. Enquiries are validated by the Express server and stored persistently in Supabase PostgreSQL.

**Problem statement:** People often need one simple place to browse travel ideas and share the basic details of a trip they are interested in. This project demonstrates a small web application for that workflow.

**Objectives**
- Display travel destinations with category, description, suggested duration and illustrative starting price.
- Let visitors search and filter destinations.
- Collect a trip enquiry with server-side validation.
- Save enquiries in a relational database.
- Demonstrate a clear frontend, REST API and database architecture.

**Target users:** Visitors who want travel inspiration. The current MVP does not include customer accounts, payments, or an admin dashboard.

## 2. Implemented features

- Responsive landing page and destination cards.
- Search by destination/country and filter by category.
- Prefilled destination in the enquiry form.
- Form validation in the browser and again on the server.
- Enquiry reference returned after a successful database insert.
- Health-check endpoint, JSON error handling, security headers and API rate limiting.
- Supabase PostgreSQL storage for destinations and trip enquiries.

The destination prices are sample estimates for a college demonstration. This is an enquiry system, not a live booking engine; it does not confirm availability, sell tickets, or take payment.

## 3. Technology stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js and Express
- Database: Supabase PostgreSQL
- Packages: `@supabase/supabase-js`, `dotenv`, `express`, `express-rate-limit`, `helmet`

## 4. Folder structure

```text
travel-tourism/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── routes/
│   │   ├── destinations.js
│   │   └── tripRequests.js
│   ├── server.js
│   ├── supabase.js
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   └── .gitignore
├── database/
│   └── schema.sql
├── .gitignore
└── README.md
```

## 5. Prerequisites

Install:
- Visual Studio Code: https://code.visualstudio.com/
- Node.js LTS (includes npm): https://nodejs.org/
- Git: https://git-scm.com/downloads
- A free Supabase account: https://supabase.com/

Check Node and npm in a terminal:

```bash
node --version
npm --version
git --version
```

Node.js 20 or newer is recommended.

## 6. Supabase database setup

1. Sign in at https://supabase.com/ and create a new project.
2. Choose a project name and database password. Keep the password private.
3. Wait until the database has finished provisioning.
4. In the project dashboard, open **SQL Editor** and create a new query.
5. Open `database/schema.sql` in VS Code, copy all its contents into the SQL Editor, and run it.
6. Open **Table Editor** and verify that `destinations` and `trip_requests` exist.
7. Open `destinations` and check that the sample destinations were inserted.

If you rerun the seed section, the SQL's `on conflict do nothing` only prevents conflicts on existing constraints; if duplicate demo destinations appear after repeated manual runs, remove the extra demo rows in Table Editor before proceeding.

## 7. Configure environment variables

In Supabase, open **Project Settings → API** (the exact menu labels may vary). Copy the project URL and the server-side service-role/secret key available to your project.

1. Open `backend/.env` in VS Code.
2. Replace `https://YOUR-PROJECT-REF.supabase.co` with your project URL.
3. Replace `replace_with_your_server_only_key` with the server-side service-role key.
4. Save the file.

`SUPABASE_URL` tells the backend which Supabase project to use. `SUPABASE_SERVICE_ROLE_KEY` lets the backend perform database operations. It is a privileged secret and must **never** be placed in frontend files or uploaded to GitHub. Keep Row Level Security enabled. The Express server validates public submissions before inserting them.

`backend/.env.example` documents the variable names with placeholders. It is safe to commit; `.env` is local configuration and is excluded by `.gitignore`. Example values do not connect to a real database.

## 8. Install and run (Windows)

1. Extract the ZIP folder.
2. Open the `travel-tourism` folder in VS Code.
3. Choose **Terminal → New Terminal**.
4. Move into the backend folder:

   ```bash
   cd backend
   ```

5. Install dependencies:

   ```bash
   npm install
   ```

   This downloads the required packages and creates `package-lock.json`.

6. Make sure `backend/.env` contains your real Supabase URL and server-only key.
7. Start the application:

   ```bash
   npm start
   ```

   Expected terminal message: `Travel Tourism is running at http://localhost:3000`

8. Open http://localhost:3000 in your browser. Do not open `index.html` directly as a file; the frontend needs the Express server for its API calls.
9. Check http://localhost:3000/api/health. Expected JSON:

   ```json
   {"status":"ok","app":"Travel Tourism API"}
   ```

If the destination list does not load, confirm the SQL ran successfully and the environment variables are correct. Stop the server with `Ctrl+C`.

For development with automatic server restarts, use `npm run dev`.

## 9. Architecture and workflow

1. The browser loads HTML, CSS and JavaScript from Express.
2. Frontend JavaScript calls the Express REST API using `fetch()`.
3. Express validates requests and uses the Supabase client on the server.
4. Supabase PostgreSQL stores and returns destination/enquiry records.
5. The server returns JSON to the browser, which updates the page.

The service-role key is used only by the backend. Row Level Security is enabled and no public table policies are added. The server is the only intended access path in this MVP.

## 10. API endpoints

| Method | Path | Purpose | Request | Success |
|---|---|---|---|---|
| GET | `/api/health` | Check server status | None | `200` status JSON |
| GET | `/api/destinations` | List active destinations | Optional `?search=...&category=Beach` | `200` `{ "data": [...] }` |
| POST | `/api/trip-requests` | Save an enquiry | JSON shown below | `201` reference and status |

Example `POST /api/trip-requests` body:

```json
{
  "name": "Asha Kumar",
  "email": "asha@example.com",
  "destinationId": 1,
  "travelDate": "2027-05-10",
  "travellers": 2,
  "message": "Prefer a relaxed itinerary."
}
```

Successful response includes `data.reference`, `data.status`, and `data.createdAt`. The reference means the enquiry was stored; it does **not** mean a trip is booked or confirmed.

Common errors: `400` invalid input, `404` unknown API endpoint, `413` oversized body, `429` too many requests, `503` missing Supabase configuration, and `500` unexpected server/database failure. Responses avoid returning raw database errors.

## 11. Manual testing checklist

| Test | Action | Expected result |
|---|---|---|
| Server health | Open `/api/health` | JSON status is `ok` |
| Destinations | Open `/api/destinations` | Destination list returned |
| Search | Search for “India” | Matching destinations appear |
| Category | Choose “Beach” | Only beach destinations appear |
| Choose destination | Click “Plan this trip” on a card | Form destination is selected |
| Valid enquiry | Submit all valid required fields with a future date | Success message and enquiry reference |
| Empty form | Submit without required fields | Browser indicates required fields |
| Invalid email | Enter invalid email | Browser/server rejects it |
| Invalid travellers | Send a request with 0 or 21 travellers | Server responds `400` |
| Past date | Send a past travel date | Server responds `400` |
| Unknown destination | Send a nonexistent destination ID | Server responds `400` |
| Missing configuration | Temporarily blank an env variable and restart | API reports service unavailable; restore configuration afterward |
| Responsive layout | Resize browser or use mobile view | Navigation and cards adapt to screen |

Test data contains personal information if you enter it. Use sample details for demonstrations and delete test enquiries from Supabase when no longer needed.

## 12. Troubleshooting

- **`npm` is not recognized:** install Node.js LTS, close and reopen the terminal, then retry `node --version` and `npm --version`.
- **Port already in use:** set another `PORT` in `backend/.env`, such as `3001`, and open the matching localhost address.
- **Supabase not configured:** check `backend/.env` spelling, save the file and restart the server.
- **Invalid API key / database error:** check the project URL and server-side key; do not paste secrets into screenshots or chat.
- **Tables not found:** rerun `database/schema.sql` in the correct Supabase project and check the Table Editor.
- **Destination cards do not load:** use the site through `http://localhost:3000`, not by double-clicking the HTML file.
- **Images unavailable:** the images are decorative external Unsplash URLs. Core search and enquiry functionality does not depend on the images, but internet access is needed to display them.

## 13. Git and GitHub upload

1. Create an empty repository on https://github.com/ (do not add a README if you already have this one).
2. Open a terminal at the root `travel-tourism` folder, not inside `backend`.
3. Run:

   ```bash
   git init
   git status
   git add .
   git status
   git commit -m "Build Travel Tourism project"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPOSITORY_URL
   git push -u origin main
   ```

4. Replace `YOUR_GITHUB_REPOSITORY_URL` with the URL shown by your own GitHub repository.
5. Confirm that the frontend, backend, database and README files appear on GitHub.

Before committing, verify that `backend/.env`, `node_modules/`, database passwords and private enquiry data are not staged. `.gitignore` does not remove a secret that was committed earlier. If a key is exposed, rotate it in Supabase immediately and clean the repository history as needed.

## 14. Security notes and limitations

- This is a student demonstration, not a production travel booking service.
- No user accounts, admin dashboard, payment, real-time availability, or cancellation workflow is included.
- Public trip enquiries are rate-limited and validated. A real deployment should add abuse monitoring, spam prevention, an admin-only enquiry dashboard, data-retention rules and a privacy notice.
- Only use real traveller information with permission.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code or public repositories.
- The sample starting prices and travel durations are illustrative and must not be treated as live offers.

## 15. Future improvements

- Add Supabase Auth and protected customer accounts.
- Build a secure admin dashboard to manage destinations and respond to enquiries.
- Add package details, date availability and verified pricing.
- Add email notifications and booking status updates.
- Add automated tests and deployment configuration.
