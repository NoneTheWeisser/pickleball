# Pickleball Night App — Scope Document

## Overview

A small web app for weekly pickleball nights with 6–7 friends. One court, four players per game, ~2 hours of play. Goals: rotate players fairly, track scores, surface fun stats over time.

**The most important rule:** "when in doubt, do the cool thing"

## Critical Rules

- No emojis unless necessary
- Never make things up - ask if unsure

# Agentic behavior

## How to work

- **Build in small steps.** Deliver working increments; avoid large unreviewable changes.
- **Unblock on ambiguity.** If requirements or design are unclear, ask a short clarifying question before implementing.
- **Prefer best practices.** Project setup, testing, and agent behavior should follow common, maintainable patterns.

## Quality

- **Testing.** Add automated tests where feasible;

## PROMPTS.md entry format

Each entry must use:

1. **Title (Category)** — Short title and category of work (e.g. Planning, Tooling, Documentation).
2. **Quote** — The user's original prompt in a blockquote (`> "..."`).
3. **Summary** — Brief summary of what was done.

Example:

```markdown
**Clockify adapter and CLI (Implementation)**

> "Implement the Clockify report script from TODO phase 1."

Added `src/clockify.js` adapter (workspace, users, time entries), defined submitted-as-≥30h, and `src/run-report.js` CLI. Wired to .env; added Jest and one unit test with mocked API.
```


---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React |
| Backend | Node.js |
| UI | Tailwind CSS |
| Database | PostgreSQL (Neon) |
| Deployment | Fly.io |

---

## User Flow

### 1. Landing Page

- Entry point to the app
- **New Game** button starts a new session

### 2. Session Setup (Add Players)

- **New Player** — Add someone who hasn't played before
- **Select existing players** — Pick from previously added players
- Mix of new + existing is fine
- **Start Game** when the group is set

### 3. Active Game

- Four players on court
- Track start time
- Enter final score (e.g., 11–9, 15–13)
- Clear display of who's playing vs. resting

### 4. Between Games

- **Start new game** → Rotation runs (see below)
- **Stop playing** → End session, show recap

---

## Rotation Rules

### Who Plays Next (4 players)

- **Priority to sit:** Players who played the last 2 games in a row
- **Priority to play:** Players who sat the previous game
- Fill to 4 so sitting/playing rotates evenly

### Who Partners With Whom

- Among the 4 playing, randomly assign 2 pairs
- No repeat partners from the previous game — reroll pairings if needed

---

## Features

### MVP

- [ ] Landing page with New Game
- [ ] Add new players
- [ ] Select existing players for a session
- [ ] Start game (first 4 on court)
- [ ] Track game start time
- [ ] Enter score when game ends
- [ ] Rotation logic (no repeat partners, rotate sitters in / 2-game players out)
- [ ] Start new game or stop playing
- [ ] Session summary on stop

### Later / Nice-to-Have

- [ ] Stats: wins, points, streaks
- [ ] Playful elements: nicknames, achievements, fun leaderboard copy
- [ ] Head-to-head records
- [ ] Historical view across sessions

### Stretch Goals

- [ ] **Leaderboard** — Standings across sessions, fun rankings
- [ ] **Profile settings** — Custom avatars, nicknames, maybe team colors
- [ ] **React Native** — Wrap / port to mobile (good learning project)
- [ ] **Admin page** — Full CRUD on players and any other entities that need it

---

## Data Model

```
Players
  - id
  - name
  - created_at

Sessions
  - id
  - date
  - started_at
  - ended_at

SessionPlayers
  - session_id
  - player_id

Games
  - id
  - session_id
  - started_at
  - ended_at
  - score_team1
  - score_team2

GamePlayers
  - game_id
  - player_id
  - team (1 or 2)
  - was_winner
```

---

## Screen Flow

```
Landing
   │
   └─[New Game]──► Session Setup (add/select players)
                        │
                        └─[Start Game]──► Game In Progress
                                               │
                                               │  4 on court, enter score
                                               │
                                               └─[Game over, score entered]
                                                        │
                                                        ├─[Start new game]──► Rotation ──► Next Game (loop)
                                                        │
                                                        └─[Stop playing]──► Session complete ──► Landing (or summary)
```

---

## Open Questions / Notes

- **Score format:** Standard pickleball (first to 11, win by 2)? Or flexible?
- **Teams:** Random 2v2 pairs each game (confirmed)
- **6–7 players:** 4 on court, 2–3 resting per game
