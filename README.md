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

1. From the landing page, click **New Game** to start a session.
2. Add players by selecting existing ones or typing in a new name.
3. Once you have at least 4 players, click **Start Game**. The first game is created automatically with randomized teams.
4. During the game, the court and bench are displayed. When the game ends, enter the final score and click **Next Game**.
5. A proposed lineup for the next game is shown — tap any two players to swap them between teams or the bench. Late arrivals can be added here as well.
6. Click **Start Game** to confirm the lineup and begin the next game.
7. When the night is over, click **Stop Playing** to end the session and view a recap with scores and win/loss records.

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
