-- Aureon users (run in Neon SQL editor if ensureSchema is skipped)
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  picture       TEXT,
  provider      TEXT NOT NULL CHECK (provider IN ('google')),
  provider_sub  TEXT NOT NULL,
  theme         TEXT NOT NULL DEFAULT 'modern'
                  CHECK (theme IN ('signal', 'modern')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_sub)
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
