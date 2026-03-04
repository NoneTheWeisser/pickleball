# Database Schema

Local: `postgresql://localhost/pickleball`
Production: set via `fly secrets set DATABASE_URL="..."`

Schema lives at `server/src/db/schema.sql`.

---

## Tables

### players
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| name | TEXT | |
| avatar_id | TEXT | optional; references client-side avatar gallery |
| created_at | TIMESTAMPTZ | default NOW() |
| deleted_at | TIMESTAMPTZ | null = active; set = soft-deleted |

### sessions
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| date | DATE | default today |
| started_at | TIMESTAMPTZ | default NOW() |
| ended_at | TIMESTAMPTZ | null until session ends |

### session_players
| Column | Type | Notes |
|--------|------|-------|
| session_id | INTEGER FK → sessions | |
| player_id | INTEGER FK → players | |

### games
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| session_id | INTEGER FK → sessions | |
| game_number | INTEGER | sequential within session |
| started_at | TIMESTAMPTZ | default NOW() |
| ended_at | TIMESTAMPTZ | null until score entered |
| score_team1 | INTEGER | |
| score_team2 | INTEGER | |

### game_players
| Column | Type | Notes |
|--------|------|-------|
| game_id | INTEGER FK → games | |
| player_id | INTEGER FK → players | |
| team | SMALLINT | 1 or 2 |
| was_winner | BOOLEAN | set when score is entered |
