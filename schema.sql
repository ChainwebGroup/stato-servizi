CREATE TABLE IF NOT EXISTS ultimo (
  servizio TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,
  ok INTEGER NOT NULL,
  codice INTEGER,
  ms INTEGER,
  errori INTEGER NOT NULL DEFAULT 0,
  ok_da INTEGER
);
CREATE TABLE IF NOT EXISTS guasti (
  servizio TEXT NOT NULL,
  ts INTEGER NOT NULL,
  codice INTEGER,
  ms INTEGER
);
CREATE INDEX IF NOT EXISTS guasti_s_ts ON guasti (servizio, ts);
CREATE TABLE IF NOT EXISTS segnalazioni (
  servizio TEXT NOT NULL,
  ts INTEGER NOT NULL,
  impronta TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS segn_s_ts ON segnalazioni (servizio, ts);
CREATE INDEX IF NOT EXISTS segn_ts ON segnalazioni (ts);
