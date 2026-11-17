"use client";
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import {
  dailyBoard,
  power,
  rotate,
  type Board,
  type Score,
} from "../../../game/model";
import styles from "./game.module.css";
import CircuitBoard, { LampArt } from "./circuit-board";
const endpoint = process.env.NEXT_PUBLIC_GAME_API_URL;
const puzzleDate = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
export default function LightTheLab({
  ref,
  reachable,
  inProjects,
  beforeOpen,
  afterClose,
}: {
  ref: Ref<{ open: (control: HTMLElement) => void }>;
  reachable: boolean;
  inProjects: boolean;
  beforeOpen: () => void;
  afterClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const book = useRef<HTMLButtonElement>(null);
  const [float, setFloat] = useState(false);
  const floated = useRef(false);
  useEffect(() => {
    if (!inProjects || floated.current) return;
    floated.current = true;
    const frame = requestAnimationFrame(() => setFloat(true));
    return () => cancelAnimationFrame(frame);
  }, [inProjects]);
  const [board, setBoard] = useState<Board>(() => dailyBoard());
  const [tiles, setTiles] = useState(board.tiles);
  const [moves, setMoves] = useState<number[]>([]);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [run, setRun] = useState("");
  const [nickname, setNickname] = useState("");
  const [scores, setScores] = useState<Score[] | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<
    "load" | "start" | "verify" | "submit" | null
  >(null);
  const busy = pending !== null;
  const [seconds, setSeconds] = useState(0);
  const [postedId, setPostedId] = useState<string | null>(null);
  const [tab, setTab] = useState("game");
  const [eligibility, setEligibility] = useState<{
    eligible: boolean;
    rank: number | null;
  } | null>(null);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const finished = useRef(false);
  const startTime = useRef(0);
  async function verify(history: number[]) {
    setPending("verify");
    setMessage("");
    setVerificationFailed(false);
    try {
      const result = await request("/finish", {
        id: run,
        player: player.current,
        moves: history,
      });
      setSeconds(result.seconds);
      setEligibility(result);
      setScores(result.scores);
    } catch (error) {
      setMessage((error as Error).message);
      setVerificationFailed(true);
    } finally {
      setPending(null);
    }
  }
  useEffect(() => {
    if (won) resultHeading.current?.focus();
  }, [won]);
  const loaded = useRef(false);
  const player = useRef("");
  async function request(path: string, data?: unknown) {
    if (!endpoint)
      throw new Error(
        "Leaderboard unavailable. You can play unranked practice.",
      );
    const response = await fetch(endpoint + path, {
      method: data ? "POST" : "GET",
      headers: data ? { "Content-Type": "application/json" } : undefined,
      body: data ? JSON.stringify(data) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Please try again.");
    return result;
  }
  function close() {
    dialog.current?.close();
    afterClose();
    const target = opener.current;
    (target?.getClientRects().length ? target : book.current)?.focus({
      preventScroll: true,
    });
  }
  function open(control: HTMLElement) {
    if (!reachable || document.querySelector("dialog[open]")) return;
    beforeOpen();
    opener.current = control;
    dialog.current?.showModal();
    if (!loaded.current) {
      loaded.current = true;
      setPending("load");
      try {
        player.current =
          localStorage.getItem("ivector-game-player") || crypto.randomUUID();
        localStorage.setItem("ivector-game-player", player.current);
      } catch {
        player.current = "";
      }
      void request("/today")
        .then((result) => {
          setBoard(result.board);
          setTiles(result.board.tiles);
          setScores(result.scores);
        })
        .catch((error) => setMessage(error.message))
        .finally(() => setPending(null));
    }
  }
  useImperativeHandle(ref, () => ({ open }));
  async function start(timestamp: number) {
    setPending("start");
    setMessage("");
    setRun("");
    let next = dailyBoard();
    try {
      if (!player.current)
        throw new Error("Browser storage unavailable. Unranked practice.");
      const result = await request("/start", { player: player.current });
      next = result.board;
      setRun(result.id);
    } catch (error) {
      setMessage((error as Error).message);
    }
    setBoard(next);
    setTiles(next.tiles);
    setMoves([]);
    setWon(false);
    finished.current = false;
    setEligibility(null);
    setVerificationFailed(false);
    setTab("game");
    setStarted(true);
    setSeconds(0);
    startTime.current = timestamp;
    setPending(null);
  }
  function turn(index: number, timestamp: number) {
    if (!started || finished.current || busy) return;
    if (moves.length >= 512) {
      setMessage("Rotation limit reached. Start a new puzzle.");
      return;
    }
    const next = [...tiles];
    next[index] = rotate(next[index]);
    const history = [...moves, index];
    setTiles(next);
    setMoves(history);
    if (power(board, next).won) {
      finished.current = true;
      setWon(true);
      setSeconds(Math.floor((timestamp - startTime.current) / 1000));
      if (run) void verify(history);
    }
  }
  async function postScore() {
    setPending("submit");
    setMessage("");
    try {
      const result = await request("/submit", {
        id: run,
        player: player.current,
        nickname,
      });
      setScores(result.scores);
      setEligibility({ eligible: false, rank: result.rank });
      if (result.accepted) {
        setPostedId(run);
        setTab("scores");
        if (dialog.current?.open) {
          const scoresTab = document.getElementById("tab-scores");
          const target = scoresTab?.getClientRects().length
            ? scoresTab
            : document.getElementById("top-five");
          target?.focus();
        }
      } else {
        setMessage(
          "The Top 5 changed before you posted. Your result is saved.",
        );
      }
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setPending(null);
    }
  }
  const rotations = `${moves.length} ${moves.length === 1 ? "rotation" : "rotations"}`;
  const dateLabel = puzzleDate.format(new Date(board.day + "T00:00:00Z"));
  return (
    <>
      <button
        ref={book}
        type="button"
        className={styles.desk}
        aria-label="Open Light the Lab"
        aria-disabled={!reachable}
        onClick={(event) => open(event.currentTarget)}
      >
        <span
          className={styles.bookArt}
          data-floating={float}
          onAnimationEnd={() => setFloat(false)}
          aria-hidden="true"
        >
          <span className={styles.bookTitle}>
            Light
            <br />
            the Lab
          </span>
          <svg
            viewBox="0 0 32 20"
            width="40"
            height="25"
            shapeRendering="crispEdges"
          >
            <path fill="#936533" d="M0 3h13l3 2 3-2h13v17H19l-3-2-3 2H0z" />
            <path
              fill="#fff0c4"
              d="M2 1h11l2 2v13l-2-1H2zm15 2 2-2h11v14H19l-2 1z"
            />
            <path
              fill="#bd9b60"
              d="M4 5h7v1H4zm0 3h7v1H4zm17-3h7v1h-7zm0 3h7v1h-7z"
            />
          </svg>
        </span>
      </button>
      {reachable && (
        <span className={styles.bookPrompt}>
          <span className={styles.keyboardPrompt}>E to open book</span>
          <span className={styles.touchPrompt}>Tap book to play</span>
        </span>
      )}
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="game-title"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
      >
        <header className={styles.header}>
          <span className={styles.lampPlate} aria-hidden="true">
            <LampArt lit={won} />
          </span>
          <div>
            <h2 id="game-title">Light the Lab</h2>
            <p className={styles.date}>
              Daily puzzle <span aria-hidden="true">·</span>{" "}
              <time dateTime={board.day}>{dateLabel}</time>
            </p>
          </div>
          <button
            className={styles.close}
            type="button"
            aria-label="Close"
            onClick={close}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              shapeRendering="crispEdges"
            >
              <path
                d="M3 3l10 10M13 3 3 13"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </button>
        </header>
        <div className={styles.tabs} role="tablist" aria-label="Game panels">
          {["game", "scores"].map((panel) => (
            <button
              key={panel}
              type="button"
              role="tab"
              tabIndex={tab === panel ? 0 : -1}
              onKeyDown={(event) => {
                if (
                  !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                    event.key,
                  )
                )
                  return;
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? "game"
                    : event.key === "End"
                      ? "scores"
                      : panel === "game"
                        ? "scores"
                        : "game";
                setTab(next);
                document.getElementById(`tab-${next}`)?.focus();
              }}
              id={`tab-${panel}`}
              aria-selected={tab === panel}
              aria-controls={`panel-${panel}`}
              onClick={() => setTab(panel)}
            >
              {panel === "game" ? "Game" : "Top 5"}
            </button>
          ))}
        </div>
        <div className={styles.layout} data-tab={tab}>
          <section
            id="panel-game"
            className={styles.gamePanel}
            aria-label="Cable puzzle"
          >
            <div className={styles.playArea}>
              <CircuitBoard
                board={board}
                tiles={tiles}
                locked={!started || won || busy}
                won={won}
                onTurn={turn}
              />
            </div>
            {!won && (
              <div className={styles.roundControls}>
                <p>Rotate each cable clockwise to connect START to END.</p>
                <div className={styles.playControls}>
                  <p role="status" className={styles.count}>
                    {rotations}
                  </p>
                  <button
                    className={started ? "button button-secondary" : "button"}
                    type="button"
                    disabled={busy}
                    onClick={(event) => void start(event.timeStamp)}
                  >
                    {pending === "start"
                      ? "Starting…"
                      : started
                        ? "Play again"
                        : "Start puzzle"}
                  </button>
                </div>
                {started && (
                  <p className={styles.timerNote}>
                    The timer keeps running if you close the puzzle.
                  </p>
                )}
                <p className={styles.notice} role="status">
                  {message}
                </p>
              </div>
            )}
            {won && (
              <section className={styles.result} aria-labelledby="round-result">
                <div className={styles.resultHeader}>
                  <h3 id="round-result" ref={resultHeading} tabIndex={-1}>
                    Lamp lit!
                  </h3>
                  <p className={styles.stats}>
                    <strong>{moves.length}</strong>{" "}
                    {moves.length === 1 ? "rotation" : "rotations"}
                    <span className={styles.statDivider} aria-hidden="true" />
                    <strong>{seconds}</strong>{" "}
                    {seconds === 1 ? "second" : "seconds"}
                  </p>
                </div>
                {eligibility?.eligible && (
                  <form
                    className={styles.entry}
                    onSubmit={(event) => {
                      event.preventDefault();
                      void postScore();
                    }}
                  >
                    <p>
                      You placed <strong>#{eligibility.rank}</strong> today.
                      Enter a nickname to post your score.
                    </p>
                    <label htmlFor="score-nickname">Nickname</label>
                    <div className={styles.fieldRow}>
                      <input
                        id="score-nickname"
                        required
                        maxLength={40}
                        autoComplete="nickname"
                        value={nickname}
                        onChange={(event) => setNickname(event.target.value)}
                      />
                      <button type="submit" className="button" disabled={busy}>
                        {pending === "submit" ? "Posting…" : "Submit score"}
                      </button>
                    </div>
                  </form>
                )}
                <p className={styles.notice} role="status">
                  {pending === "verify"
                    ? "Verifying result…"
                    : message ||
                      (eligibility && !eligibility.eligible && postedId !== run
                        ? "This round didn’t place in today’s Top 5."
                        : "")}
                </p>
                <div className={styles.resultActions}>
                  {verificationFailed && (
                    <button
                      type="button"
                      className="button"
                      disabled={busy}
                      onClick={() => void verify(moves)}
                    >
                      Retry verification
                    </button>
                  )}
                  <button
                    type="button"
                    className="button button-secondary"
                    disabled={busy}
                    onClick={(event) => void start(event.timeStamp)}
                  >
                    {pending === "start" ? "Starting…" : "Play again"}
                  </button>
                </div>
              </section>
            )}
          </section>
          <section
            id="panel-scores"
            className={styles.scorePanel}
            aria-labelledby="top-five"
          >
            <header className={styles.scoreHeading}>
              <svg
                className={styles.trophy}
                aria-hidden="true"
                viewBox="0 0 20 20"
                width="25"
                height="25"
                shapeRendering="crispEdges"
              >
                <path
                  fill="currentColor"
                  d="M4 2h12v2h3v5h-2v2h-3v2h-3v3h3v2H6v-2h3v-3H6v-2H3V9H1V4h3zm0 4H3v2h1zm12 0v2h1V6z"
                />
                <path fill="var(--trophy-light)" d="M6 4h2v5H6zM8 4h5v2H8z" />
              </svg>
              <h3 id="top-five" tabIndex={-1}>
                Today’s Top 5
              </h3>
            </header>
            <table aria-labelledby="top-five">
              <thead>
                <tr>
                  <th scope="col">Rank</th>
                  <th scope="col">Nickname</th>
                  <th scope="col">Turns</th>
                  <th scope="col">Time</th>
                </tr>
              </thead>
              <tbody>
                {scores?.length ? (
                  scores.map((score) => (
                    <tr key={score.id} data-own={score.id === postedId}>
                      <td>#{score.rank}</td>
                      <th scope="row">
                        {score.nickname}
                        {score.id === postedId && (
                          <span className={styles.you}> (you)</span>
                        )}
                      </th>
                      <td>{score.moves}</td>
                      <td>{score.seconds}s</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={styles.empty} colSpan={4}>
                      {pending === "load"
                        ? "Loading scores…"
                        : scores
                          ? "No scores yet."
                          : "Scores unavailable."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <p className={styles.posted} role="status">
              {postedId === run ? "Score posted." : ""}
            </p>
            <p className={styles.scoreNote}>
              Best round per browser. Ranked by rotations, then time.
            </p>
          </section>
        </div>
      </dialog>
    </>
  );
}
