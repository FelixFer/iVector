CREATE SCHEMA IF NOT EXISTS lab_game;
CREATE TABLE IF NOT EXISTS lab_game.runs (
 id uuid PRIMARY KEY, player uuid NOT NULL, day date NOT NULL,
 started timestamptz NOT NULL DEFAULT now(), finished timestamptz,
 moves integer, seconds integer, nickname text, hidden boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS game_day_scores ON lab_game.runs(day,moves,seconds,finished);
