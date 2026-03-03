# Pickleball Night

Duration: Ongoing

A lightweight web app for managing weekly pickleball nights with a small group of friends. One court, rotating players, and a running record of scores and stats.

The app handles the logistics so you can focus on playing: add players for the night (including late arrivals), auto-rotates who sits out and who plays next, lets you override the lineup before each game, and tracks wins and losses across the session.

To see the fully functional site, please visit: https://nonetheweisser-pickleball-night.fly.dev

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher — required for `node --watch`)
- [PostgreSQL](https://www.postgresql.org/) — we recommend [Postgres.app](https://postgresapp.com/) for local development
- [Postico](https://eggerapps.at/postico2/) (optional, but handy for browsing the database)

---

## Installation

1. Clone the repo and navigate into the project folder.

2. Install dependencies:
   ```
   npm install
   ```

3. Create a local PostgreSQL database named `pickleball`.

4. Run the schema to create all tables. You can paste the contents of `server/src/db/schema.sql` directly into Postico, or run it via the command line:
   ```
   psql postgresql://localhost/pickleball -f server/src/db/schema.sql
   ```

5. Create your environment file:
   ```
   cp server/.env.example server/.env
   ```
   The default value (`postgresql://localhost/pickleball`) works for local development with Postgres.app. No other changes needed to get started locally.

6. Start the app:
   ```
   npm run dev
   ```
   This starts both the backend (port 3001) and frontend (port 5173) together.

7. Open your browser to `http://localhost:5173`.

---

## Usage

1. From the landing page, click **Start** to begin a new session.
2. Add players by selecting existing ones or typing in a new name. You need at least 4 to start.
3. Click **Start Game**. A proposed lineup is shown — tap any two players to swap them between teams or the bench before confirming.
4. During the game, the court and bench are displayed. Tap the **SCORE** button to open a full-screen score entry sheet with large touch-friendly inputs.
5. Enter the final score as two integers — no format enforcement, so any score works (11–9, 15–13, etc.).
6. When the game ends, click **Next Game** to see the next proposed lineup. Adjust teams or bench as needed, or add a late arrival directly from this screen. You can also edit a previously submitted score if you made a mistake.
7. Click **Stop Playing** to end the session and view a recap with scores and win/loss records for every player.
8. The **Leaderboard** shows stats across all sessions.

### Resuming a session

If you close the tab or navigate away mid-session, a **Load Game** button appears on the landing page whenever there are sessions still in progress. Clicking it opens a modal listing all resumable sessions with player names, games played, and date — tap any entry to jump straight back in.

### Head-to-head mode

On the session setup screen you can switch to **Head-to-head** mode for 1v1 play. Rotation and team assignment are skipped — only two players are on court at a time.

---

## Options

Click the **Options** button at the bottom of the landing page to access app settings. Currently the only entry is **Admin Panel**.

### Admin Panel (`/admin`)

The admin panel is split into two tabs.

**Players tab**
- **Edit** any player's name inline
- **Delete** a player (soft delete — their historical data is preserved)
- **Restore** a deleted player from the collapsed Deleted section

**Sessions tab**
- Lists all sessions by date with their mode and status
- **Delete** a session — permanently removes the session and all associated games and scores (requires inline confirmation)

---

## Deployment

The app is deployed on [Fly.io](https://fly.io/) with [Neon](https://neon.tech/) as the production database.

- **Local dev** uses a local PostgreSQL database (`postgresql://localhost/pickleball`) — no SSL required
- **Production** uses a Neon connection string stored as a Fly secret (`DATABASE_URL`) — SSL is applied automatically

To deploy:
```
npm run build
fly deploy
```

The build step compiles the React client into `client/dist/`, which the Express server serves as static files in production.

---

## Built With

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/) / [Neon](https://neon.tech/) (production)
- [Fly.io](https://fly.io/) (deployment)

---

## License

MIT

---

## Support

If you have suggestions or issues, please open a GitHub issue or reach out directly.
