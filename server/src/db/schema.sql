CREATE TABLE IF NOT EXISTS players (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sessions (
  id         SERIAL PRIMARY KEY,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at   TIMESTAMPTZ,
  mode       VARCHAR(10) NOT NULL DEFAULT 'team'
);

CREATE TABLE IF NOT EXISTS session_players (
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id  INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, player_id)
);

CREATE TABLE IF NOT EXISTS games (
  id           SERIAL PRIMARY KEY,
  session_id   INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  game_number  INTEGER NOT NULL,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at     TIMESTAMPTZ,
  score_team1  INTEGER,
  score_team2  INTEGER
);

CREATE TABLE IF NOT EXISTS game_players (
  game_id    INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id  INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team       SMALLINT NOT NULL CHECK (team IN (1, 2)),
  was_winner BOOLEAN,
  PRIMARY KEY (game_id, player_id)
);
