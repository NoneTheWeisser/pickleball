# Pickleball Night

A lightweight web app for managing weekly pickleball nights with a small group of friends. One court, rotating players, and a running record of scores and stats.

The app handles the logistics so you can focus on playing: add players for the night (including late arrivals), auto-rotates who sits out and who plays next, lets you override the lineup before each game, and tracks wins and losses across the session.

**Live demo:** https://nonetheweisser-pickleball-night.fly.dev

---

## Features

- **Session setup** — Select or create players with custom avatars; supports 2v2 team mode or 1v1 head-to-head
- **Auto-rotation** — Fair rotation of who sits and who plays next
- **Lineup editor** — Tap players to swap teams or bench before each game
- **Score tracking** — Touch-friendly score entry, game clock, session history
- **Leaderboard** — Win/loss stats across all sessions
- **Retro arcade UI** — Trapezoidal matchup panels, card-style character tiles, glowing VS display

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

4. Run the schema and migrations to create all tables:
   ```
   psql postgresql://localhost/pickleball -f server/src/db/schema.sql
   psql postgresql://localhost/pickleball -f server/src/db/migrations/001_add_session_mode.sql
   psql postgresql://localhost/pickleball -f server/src/db/migrations/002_add_player_avatar.sql
   ```
   Or paste each file into Postico (schema first, then migrations in order).

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

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client + server (concurrently) |
| `npm run build` | Build client for production |
| `npm start` | Run server only (after build) |
| `npm run deploy` | Build and deploy to Fly.io |

### Database migrations

If you pull updates that add new migrations (e.g. `server/src/db/migrations/003_*.sql`), run them in order:
```
psql postgresql://localhost/pickleball -f server/src/db/migrations/003_whatever.sql
```
Production (Neon) migrations are run manually or via your deploy pipeline.

---

## Usage

1. From the landing page, click **Start** to begin a new session (or choose Head-to-head for 1v1).
2. On the Select Players screen, tap existing player cards to select them, or tap **+ New Player** to add someone with a custom avatar. You need at least 4 for team mode, 2 for head-to-head.
3. Click **Start Game**. A proposed lineup appears in arcade-style matchup panels — tap any two players to swap them between teams or the bench before confirming.
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

## Project Structure

```
pickleball/
├── client/              # React + Vite frontend (port 5173)
│   ├── src/
│   │   ├── components/   # ArcadeMatchup, AvatarDisplay, AvatarPicker, LineupEditor, etc.
│   │   ├── pages/        # Landing, SessionSetup, GameInProgress, etc.
│   │   ├── data/         # avatars.js (character gallery)
│   │   └── lib/          # logError
│   ├── img/              # Custom avatar images (PNG)
│   └── tailwind.config.js
├── server/               # Express API (port 3001)
│   ├── src/
│   │   ├── routes/       # players, sessions, games, leaderboard
│   │   ├── db/           # schema, migrations, pool
│   │   └── lib/          # rotation logic
│   └── .env              # DATABASE_URL (create from .env.example)
└── docs/                 # ARCADE_UI.md, PROMPTS.md (checkpoint history)
```

### Adding custom avatars

1. Add a PNG to `client/img/`
2. Import it in `client/src/data/avatars.js`
3. Add `{ id: 'my_avatar', label: 'My Avatar', src: myImage }` to `AVATAR_GALLERY`

See [docs/ARCADE_UI.md](docs/ARCADE_UI.md) for full details.

### Accessibility

The arcade UI respects `prefers-reduced-motion` — animations are disabled when the user has requested reduced motion in their OS settings.

---

## Documentation

| File | Purpose |
|------|---------|
| [docs/ARCADE_UI.md](docs/ARCADE_UI.md) | Arcade-style UI, avatars, components, data model |
| [docs/PROMPTS.md](docs/PROMPTS.md) | Checkpoint history of features and fixes |
| [docs/note.md](docs/note.md) | Development workflow (build in small steps, checkpoint docs) |
| [database.md](database.md) | Database schema reference |
| [scope.md](scope.md) | App scope, rules, tech stack |

---

## Troubleshooting

- **Teams not showing / lineup editor crash** — Ensure you've run migration `002_add_player_avatar.sql`. If you see `Cannot read properties of null` in LineupEditor, the proposed rotation may have returned sparse data; the client now filters these out.
- **Port already in use** — The dev server uses 5173 (client) and 3001 (server). Stop other processes on those ports or adjust `vite.config.js` and `server/src/index.js`.
- **Database connection failed** — Verify Postgres is running and `DATABASE_URL` in `server/.env` points to your database.

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
