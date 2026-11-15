"use client";

import { useEffect, useRef, useState } from "react";
import { useSceneMotion } from "./motion";
import styles from "./page-accent.module.css";

export type Accent = "About" | "Research" | "Projects" | "People" | "Publications";

export function PageAccent({ kind }: { kind: Accent }) {
  const { ref, active, visible, foreground } = useSceneMotion();
  const consumed = useRef(false);
  const [play, setPlay] = useState(false);
  useEffect(() => {
    if (!visible || !foreground || consumed.current) return;
    consumed.current = true;
    if (!active) return;
    const frame = requestAnimationFrame(() => setPlay(true));
    return () => cancelAnimationFrame(frame);
  }, [active, visible, foreground]);
  useEffect(() => { if (active) return; const frame = requestAnimationFrame(() => setPlay(false)); return () => cancelAnimationFrame(frame); }, [active]);
  return <div onAnimationEnd={() => setPlay(false)} ref={ref} className={styles.accent} data-kind={kind} data-play={play && active} aria-hidden="true">
    <svg viewBox="0 0 96 72" shapeRendering="crispEdges">
      <path fill="var(--color-border)" d="M8 64h80v2H8z" />
      {kind === "About" && <><path fill="var(--color-blue)" d="M14 52h38v10H14z" /><path fill="var(--color-text)" d="M58 58h24v4H58zM68 28h4v30h-4z" /><path className={styles.detail} fill="#edc987" d="M62 14h16l8 18H54z" /><path fill="var(--color-paper)" d="M18 54h30v4H18z" /></>}
      {kind === "Research" && <><path fill="var(--color-blue)" d="M10 20h34l4 4 4-4h34v40H52l-4 4-4-4H10z" /><path fill="var(--color-paper)" d="M14 24h28v32H14zM54 24h28v32H54z" /><path fill="var(--color-text)" d="M46 26h4v32h-4z" /><path className={styles.detail} fill="var(--color-link)" d="M20 34h18v2H20zM20 42h14v2H20zM60 34h16v2H60z" /></>}
      {kind === "Projects" && <><path fill="var(--color-text)" d="M14 12h68v40H14zM44 52h8v8h14v4H30v-4h14z" /><path fill="var(--color-blue)" d="M18 16h60v32H18z" /><g className={styles.detail}><path fill="var(--color-paper)" d="M26 24h44v20H26z" /><path fill="var(--color-link)" d="M26 24h44v4H26zM32 34h20v2H32z" /></g></>}
      {kind === "People" && <><g className={styles.detail} fill="var(--color-blue)"><path d="M24 14h12v18H24zM60 14h12v18H60zM24 48h12v16H24zM60 48h12v16H60z" /></g><path fill="#bd977a" d="M16 30h64v20H16z" /><path fill="var(--color-text)" d="M20 50h4v12h-4zM72 50h4v12h-4z" /><path fill="var(--color-paper)" d="M38 34h20v12H38z" /></>}
      {kind === "Publications" && <><path fill="var(--color-blue)" d="M14 50h64v12H14z" /><path fill="#ddcbdf" d="M20 36h62v12H20z" /><path fill="#ddc7af" d="M14 20h60v14H14z" /><path fill="var(--color-paper)" d="M18 24h52v6H18zM24 40h54v4H24zM18 54h56v4H18z" /><path className={styles.detail} fill="var(--color-link)" d="M54 20h8v22l-4-4-4 4z" /></>}
    </svg>
  </div>;
}

export function CopyEmail({ email }: { email: string }) {
  const [available, setAvailable] = useState(false), [status, setStatus] = useState("");
  useEffect(() => { const frame = requestAnimationFrame(() => setAvailable(Boolean(navigator.clipboard?.writeText))); return () => cancelAnimationFrame(frame); }, []);
  useEffect(() => { if (!status) return; const timer = setTimeout(() => setStatus(""), 2000); return () => clearTimeout(timer); }, [status]);
  if (!available) return null;
  return <span className={styles.copy}><button type="button" className="button button-secondary" aria-label={`Copy email ${email}`} onClick={async () => {
    try { await navigator.clipboard.writeText(email); setStatus("Copied"); } catch { setStatus("Select email to copy"); }
  }}>Copy email</button><span role="status">{status}</span></span>;
}
