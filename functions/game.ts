import { Pool } from "pg";
import { randomUUID } from "node:crypto";
import { createRemoteJWKSet } from "jose";
import { createTokenVerifier } from "../cms/server/auth";
import { dailyBoard, replay, today } from "../game/model";
const pool = new Pool({
  connectionString: process.env.GAME_DATABASE_URL,
  max: 3,
  statement_timeout: 10000,
});
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function leaderboard(
  day: string,
  candidate: string | null = null,
  database: Pick<Pool, "query"> = pool,
) {
  const result = await database.query(
    `SELECT id,nickname,moves,seconds,row_number() OVER (ORDER BY moves,seconds,finished,id)::int AS rank FROM (SELECT DISTINCT ON(player) * FROM lab_game.runs r WHERE day=$1 AND (nickname IS NOT NULL OR id=$2) AND finished IS NOT NULL AND NOT EXISTS(SELECT 1 FROM lab_game.runs h WHERE h.day=r.day AND h.player=r.player AND h.hidden) ORDER BY player,moves,seconds,finished,id) best ORDER BY rank`,
    [day, candidate],
  );
  return result.rows;
}
const gameFunction = {
  async fetch(request: Request) {
    const origin = request.headers.get("origin") || "";
    const allowed = (process.env.GAME_ALLOWED_ORIGINS || "").split(",");
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : "null",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Cache-Control": "no-store",
      Vary: "Origin",
    };
    const send = (value: unknown, status = 200) =>
      new Response(JSON.stringify(value), { status, headers });
    try {
      if (origin && !allowed.includes(origin))
        return send({ error: "Origin not allowed." }, 403);
      if (request.method === "OPTIONS")
        return new Response(null, { status: 204, headers });
      const path = new URL(request.url).pathname;
      if (request.method === "GET" && path === "/today")
        return send({
          board: dailyBoard(),
          scores: (await leaderboard(today())).slice(0, 5),
        });
      if (path.startsWith("/admin")) {
        const verify = createTokenVerifier(
          createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL!)),
          new URL(process.env.NEON_AUTH_BASE_URL!).origin,
        );
        let owner = "";
        try {
          owner = await verify(
            (request.headers.get("authorization") || "").replace(
              /^Bearer /,
              "",
            ),
          );
        } catch {
          return send({ error: "Sign in again." }, 401);
        }
        if (owner !== process.env.CMS_OWNER_ID)
          return send({ error: "Access denied." }, 403);
        if (request.method === "GET")
          return send({
            scores: (
              await pool.query(
                "SELECT id,day,nickname,moves,seconds,hidden FROM lab_game.runs WHERE nickname IS NOT NULL ORDER BY finished DESC LIMIT 100",
              )
            ).rows,
          });
        if (
          request.method === "POST" &&
          /^\/admin\/hide\/[0-9a-f-]+$/.test(path)
        ) {
          await pool.query("UPDATE lab_game.runs SET hidden=true WHERE id=$1", [
            path.split("/").pop(),
          ]);
          return send({ ok: true });
        }
        return send({ error: "Unknown operation." }, 404);
      }
      if (request.method !== "POST")
        return send({ error: "Unknown operation." }, 404);
      const raw = await request.text();
      if (raw.length > 8192) return send({ error: "Request too large." }, 413);
      const data = JSON.parse(raw);
      if (!uuid.test(data.player))
        throw new Error("Invalid browser identifier.");
      if (path === "/start") {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
            data.player,
          ]);
          const count = await client.query(
            "SELECT count(*)::int n FROM lab_game.runs WHERE player=$1 AND started>now()-interval '1 hour'",
            [data.player],
          );
          if (count.rows[0].n >= 30)
            throw new Error("Please wait before starting another round.");
          const id = randomUUID(),
            day = today();
          await client.query(
            "INSERT INTO lab_game.runs(id,player,day) VALUES($1,$2,$3)",
            [id, data.player, day],
          );
          await client.query("COMMIT");
          return send({ id, board: dailyBoard(day) });
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        } finally {
          client.release();
        }
      }
      if (!uuid.test(data.id)) throw new Error("Invalid round.");
      const result = await pool.query(
        "SELECT *,to_char(day,'YYYY-MM-DD') AS date FROM lab_game.runs WHERE id=$1 AND player=$2",
        [data.id, data.player],
      );
      const run = result.rows[0];
      if (!run) throw new Error("Round unavailable.");
      if (path === "/finish") {
        replay(dailyBoard(run.date), data.moves);
        await pool.query(
          "UPDATE lab_game.runs SET finished=now(),moves=$3,seconds=greatest(0,floor(extract(epoch FROM(now()-started)))) WHERE id=$1 AND player=$2 AND finished IS NULL",
          [data.id, data.player, data.moves.length],
        );
        const saved = await pool.query(
          "SELECT seconds FROM lab_game.runs WHERE id=$1",
          [data.id],
        );
        const projected = await leaderboard(run.date, data.id);
        const rank =
          projected.find((score) => score.id === data.id)?.rank ?? null;
        return send({
          ...saved.rows[0],
          eligible: rank !== null && rank <= 5,
          rank,
          scores: (await leaderboard(run.date)).slice(0, 5),
        });
      }
      if (path === "/submit") {
        const name =
          typeof data.nickname === "string"
            ? data.nickname.normalize("NFC").trim()
            : "";
        if (
          !name ||
          [
            ...new Intl.Segmenter(undefined, {
              granularity: "grapheme",
            }).segment(name),
          ].length > 20 ||
          /[\p{C}<>]/u.test(name)
        )
          throw new Error("Use 1–20 visible characters for your nickname.");
        if (!run.finished) throw new Error("Finish the puzzle first.");
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
            run.date,
          ]);
          const projected = await leaderboard(run.date, data.id, client);
          const rank = projected.find((score) => score.id === data.id)?.rank;
          if (!run.nickname && (!rank || rank > 5)) {
            await client.query("COMMIT");
            return send({
              accepted: false,
              rank: null,
              scores: (await leaderboard(run.date)).slice(0, 5),
            });
          }
          await client.query(
            "UPDATE lab_game.runs SET nickname=$3 WHERE id=$1 AND player=$2 AND nickname IS NULL",
            [data.id, data.player, name],
          );
          const scores = await leaderboard(run.date, null, client);
          await client.query("COMMIT");
          return send({
            accepted: true,
            scores: scores.slice(0, 5),
            rank: scores.find((score) => score.id === data.id)?.rank ?? null,
          });
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        } finally {
          client.release();
        }
      }
      return send({ error: "Unknown operation." }, 404);
    } catch (error) {
      return send(
        {
          error:
            error instanceof Error && !("code" in error)
              ? error.message
              : "Game service unavailable. Please try again.",
        },
        400,
      );
    }
  },
};

export default gameFunction;
