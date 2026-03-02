# Pickleball Night

Duration: Ongoing

A lightweight web app for managing weekly pickleball nights with a small group of friends. One court, rotating players, and a running record of scores and stats.

The app handles the logistics so you can focus on playing: add players for the night (including late arrivals), auto-rotates who sits out and who plays next, lets you override the lineup before each game, and tracks wins and losses across the session.

To see the fully functional site, please visit: _not yet deployed_

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
   The default value (`postgresql://localhost/pickleball`) works for local development with Postgres.app. No other changes needed to get started.

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
4. During the game, the court and bench are displayed with the current score inputs.
5. Scores follow standard pickleball rules: first to 11, win by 2. The app validates the score before letting you proceed.
6. When the game ends, enter the final score and click **Next Game** to see the next proposed lineup. Adjust teams or bench as needed, or add a late arrival directly from this screen.
7. Click **Stop Playing** to end the session and view a recap with scores and win/loss records for every player.
8. The **Leaderboard** shows stats across all sessions.

---

## Admin

Player management is available at `/admin`. From there you can:

- **Edit** any player's name inline
- **Delete** a player (soft delete — their historical data is preserved)
- **Restore** a deleted player from the collapsed Deleted section

There is also a hidden link to `/admin` on the landing page. Good luck finding it.

---

## Built With

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Fly.io](https://fly.io/) _(deployment target)_

---

## License

MIT

---

## Support

If you have suggestions or issues, please open a GitHub issue or reach out directly.
