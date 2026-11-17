"use client";
import { useState } from "react";
export default function GameScores({
  token,
}: {
  token: () => Promise<string>;
}) {
  const [scores, setScores] = useState<
    { id: string; nickname: string; day: string; hidden: boolean }[]
  >([]);
  const [message, setMessage] = useState("");
  async function load(hide?: string) {
    try {
      const base = process.env.NEXT_PUBLIC_GAME_API_URL;
      if (!base) throw new Error("Game service is not configured.");
      const headers = { Authorization: `Bearer ${await token()}` };
      if (hide) {
        const response = await fetch(`${base}/admin/hide/${hide}`, {
          method: "POST",
          headers,
        });
        if (!response.ok) throw new Error("Could not hide score.");
      }
      const response = await fetch(`${base}/admin`, { headers });
      if (!response.ok)
        throw new Error("Could not load scores. Sign in again.");
      setScores((await response.json()).scores);
      setMessage("");
    } catch (error) {
      setMessage((error as Error).message);
    }
  }
  return (
    <section>
      <h2>Game scores</h2>
      <button className="button button-secondary" onClick={() => void load()}>
        Load game scores
      </button>
      <p role="status">{message}</p>
      <ul>
        {scores.map((score) => (
          <li key={score.id}>
            {score.day.slice(0, 10)} · {score.nickname}{" "}
            {score.hidden ? (
              "Hidden"
            ) : (
              <button
                className="button button-secondary"
                onClick={() => void load(score.id)}
              >
                Hide score
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
