import { Pool } from "pg";
import { readFile, appendFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
const connectionString = process.env.CMS_SETUP_DATABASE_URL;
if (!connectionString)
  throw new Error(
    "Set CMS_SETUP_DATABASE_URL privately before running game setup.",
  );
const pool = new Pool({ connectionString });
try {
  await pool.query(await readFile("game/migration.sql", "utf8"));
  const role = await pool.query(
    "SELECT 1 FROM pg_roles WHERE rolname='ivector_game'",
  );
  if (!role.rowCount) {
    const password = randomBytes(32).toString("hex");
    await pool.query(`CREATE ROLE ivector_game LOGIN PASSWORD '${password}'`);
    const url = new URL(process.env.CMS_SETUP_DATABASE_URL);
    url.username = "ivector_game";
    url.password = password;
    await appendFile(".env.local", `\nGAME_DATABASE_URL=${url.href}\n`);
  }
  await pool.query("GRANT USAGE ON SCHEMA lab_game TO ivector_game");
  await pool.query(
    "GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA lab_game TO ivector_game",
  );
  console.log("Game schema and restricted role ready.");
} finally {
  await pool.end();
}
