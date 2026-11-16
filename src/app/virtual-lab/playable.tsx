"use client";

import { LabMapArt } from "@/components/lab-map-art";
import { useSceneMotion } from "@/components/motion";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { canStand, guideNear, guides, hasLineOfSight, move, roomAt, spawn, vectors, type Direction, type Guide } from "./scene-data";
import styles from "./virtual-lab.module.css";

const keys: Record<string, Direction> = {
  arrowup: "up", w: "up", arrowdown: "down", s: "down",
  arrowleft: "left", a: "left", arrowright: "right", d: "right",
};
const arrows: Record<Direction, string> = { up: "↑", left: "←", down: "↓", right: "→" };

function Sprite({ facing = "down" }: { facing?: Direction }) {
  return <svg viewBox="0 0 8 12" aria-hidden="true" shapeRendering="crispEdges" className={styles.sprite}>
    <path fill="#343a40" d="M2 0h4v1h1v4H1V1h1z" />
    <path fill="#e7bd98" d="M2 2h4v3H2zM0 6h1v3H0zm7 0h1v3H7z" />
    {facing === "up" ? <path fill="#343a40" d="M1 1h6v4H1z" /> : <path fill="#343a40" d={facing === "left" ? "M2 3h1v1H2z" : facing === "right" ? "M5 3h1v1H5z" : "M2 3h1v1H2zm3 0h1v1H5z"} />}
    <path fill="currentColor" d="M1 5h6v5H1z" />
    <path className={styles.legs} fill="#343a40" d="M1 10h2v2H1zm4 0h2v2H5z" />
  </svg>;
}

export default function Playable() {
  const [ready, setReady] = useState(false);
  const [position, setPosition] = useState(spawn);
  const [facing, setFacing] = useState<Direction>("down");
  const [walking, setWalking] = useState(false);
  const [guide, setGuide] = useState<Guide | null>(null);
  const held = useRef(new Map<string, Direction>());
  const dialog = useRef<HTMLDialogElement>(null);
  const { ref: scene, active, visible, foreground } = useSceneMotion();
  const currentPosition = useRef(spawn);
  const currentFacing = useRef<Direction>("down");
  const activity = useRef({ visible: true, foreground: true });
  useEffect(() => { activity.current = { visible, foreground }; }, [visible, foreground]);
  const origin = useRef<HTMLElement | null>(null);
  const nearby = guideNear(position);
  const room = roomAt(position);
  const blocked = !nearby && guides.find(g => Math.hypot(g.x-position.x, g.y-position.y) <= 12 && !hasLineOfSight(position, g));
  const [wake, setWake] = useState<string | null>(null);
  const lastRoom = useRef(room);
  useEffect(() => {
    if (lastRoom.current === room) return;
    lastRoom.current = room;
    if (!active || !["Research", "Projects"].includes(room)) return;
    const frame = requestAnimationFrame(() => setWake(room));
    const timer = setTimeout(() => setWake(null), 400);
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); setWake(null); };
  }, [room, active]);
  const [greeted, setGreeted] = useState(new Set<string>());
  const greeting = nearby && !greeted.has(nearby.href) ? nearby.href : null;
  useEffect(() => () => { if (nearby) setGreeted(previous => new Set(previous).add(nearby.href)); }, [nearby]);
  useEffect(() => {
    if (active || !nearby) return;
    const frame = requestAnimationFrame(() => setGreeted(previous => new Set(previous).add(nearby.href)));
    return () => cancelAnimationFrame(frame);
  }, [active, nearby]);
  function entrance() { stop(); currentPosition.current = spawn; currentFacing.current = "down"; setPosition(spawn); setFacing("down"); try { sessionStorage.removeItem("ivector-position-v1"); } catch {} scene.current?.focus({ preventScroll: true }); }

  function stop() { held.current.clear(); setWalking(false); }
  function talk(selected: Guide, control: HTMLElement) {
    if (!hasLineOfSight(position, selected)) return;
    stop(); origin.current = control;
    // Render the selected guide before native dialog focus and announcements run.
    flushSync(() => setGuide(selected));
    dialog.current?.showModal();
  }
  function closeDialogue() {
    dialog.current?.close(); stop();
    const target = origin.current;
    (target?.isConnected ? target : scene.current)?.focus();
  }
  useEffect(() => {
    if (ready && (document.activeElement === document.body || document.activeElement?.id === "main")) {
      scene.current?.focus({ preventScroll: true });
    }
  }, [ready, scene]);
  useEffect(() => {
    let frame = 0, last = 0;
    const inputs = held.current;
    try {
      const saved = JSON.parse(sessionStorage.getItem("ivector-position-v1") || "null");
      if (saved?.version === 1 && Number.isFinite(saved.x) && Number.isFinite(saved.y) && canStand(saved) && ["up", "down", "left", "right"].includes(saved.facing)) { currentPosition.current = { x: saved.x, y: saved.y }; currentFacing.current = saved.facing; }
    } catch {}
    const save = () => { try { sessionStorage.setItem("ivector-position-v1", JSON.stringify({ version: 1, ...currentPosition.current, facing: currentFacing.current })); } catch {} };
    window.addEventListener("pagehide", save);
    const cancel = () => { held.current.clear(); setWalking(false); };
    const tick = (time: number) => {
      if (!last) { setPosition(currentPosition.current); setFacing(currentFacing.current); setReady(true); }
      const seconds = last ? (time - last) / 1000 : 0;
      last = time;
      let x = 0, y = 0;
      held.current.forEach(direction => { x += vectors[direction].x; y += vectors[direction].y; });
      if (!activity.current.visible || !activity.current.foreground) held.current.clear();
      const moving = (x !== 0 || y !== 0) && !dialog.current?.open && activity.current.visible && activity.current.foreground;
      if (!moving) setWalking(false);
      if (moving) {
        currentFacing.current = x ? x > 0 ? "right" : "left" : y > 0 ? "down" : "up";
        setFacing(currentFacing.current);
        const before = currentPosition.current;
        const next = move(before, { x, y }, seconds);
        setWalking(next.x !== before.x || next.y !== before.y);
        currentPosition.current = next; setPosition(next);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const release = (event: KeyboardEvent) => held.current.delete(`key:${event.key.toLowerCase()}`);
    window.addEventListener("keyup", release); window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", cancel);
    return () => {
      cancelAnimationFrame(frame); inputs.clear(); save(); window.removeEventListener("pagehide", save);
      window.removeEventListener("keyup", release); window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", cancel);
    };
  }, []);
  return <>
    <p id="walk-instructions" className={styles.instructions}>
      <span className={styles.keyboardPrompt}>Arrow keys / WASD to move. E or click a guide to talk.</span>
      <span className={styles.touchPrompt}>Use the direction buttons to move. Tap a guide to talk.</span>
    </p>
    <div ref={scene} className={styles.scene} data-motion-active={active} role="group" tabIndex={ready ? 0 : undefined}
      aria-label="Walk around the lab" aria-describedby="walk-instructions"
      onBlur={stop} onPointerDown={event => { if (event.target === event.currentTarget) scene.current?.focus(); }}
      onKeyDown={event => {
        if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
        const key = event.key.toLowerCase();
        if (keys[key]) { event.preventDefault(); held.current.set(`key:${key}`, keys[key]); }
        if (key === "e" && nearby && !event.repeat) { event.preventDefault(); talk(nearby, event.currentTarget); }
      }}>
      <LabMapArt />
      {ready && active && wake === room && <svg key={room} className={styles.monitorWake} viewBox="0 0 240 140" aria-hidden="true"><path fill="#fff7e9" d={room === "Research" ? "M36 26.8h11v4.8H36z" : "M150 27.6h11v4.8h-11zM186 27.6h11v4.8h-11z"} /></svg>}
      {room !== "Central corridor" && <svg key={room} className={styles.roomOutline} data-animate={active} viewBox="0 0 240 140" aria-hidden="true"><rect x={room === "Research" || room === "People" ? 13 : 137} y={room === "Research" || room === "Projects" ? 10 : 82} width="90" height={room === "Research" || room === "Projects" ? 47 : 42} /></svg>}
      {guides.map(g => <span key={g.href} className={`${styles.roomSign} ${styles[g.label.toLowerCase()]}`} data-room={g.label}
        style={{ left: `${g.sign.x / 2.4}%`, top: `${g.sign.y / 1.4}%` }}>{g.label}</span>)}
      {ready && <>
        <span className={styles.player} data-facing={facing} data-walking={walking} data-x={position.x} data-y={position.y}
          style={{ left: `${position.x / 2.4}%`, top: `${position.y / 1.4}%` }} aria-hidden="true"><Sprite facing={facing} /></span>
        {nearby && <span className={styles.talkPrompt} aria-hidden="true" data-testid="talk-prompt"
          style={{ left: `clamp(0px, ${position.x / 2.4}% + 0.75rem, 100% - 7.5rem)`, top: `clamp(0px, ${position.y / 1.4}% - 2rem, 100% - 2rem)` }}>
          <span className={styles.keyboardPrompt}>E to talk</span><span className={styles.touchPrompt}>Tap guide to talk</span>
        </span>}
        {guides.map(g => <button type="button" key={g.href} className={styles.guide} aria-label={`Talk to ${g.label} Guide`}
          disabled={!hasLineOfSight(position, g)} title={hasLineOfSight(position, g) ? `${g.label} Guide` : `Walk through the doorway to talk to ${g.label} Guide`}
          style={{ left: `${g.x / 2.4}%`, top: `${g.y / 1.4}%`, color: g.color }}
          onClick={event => talk(g, event.currentTarget)} data-greeting={greeting === g.href} onAnimationEnd={() => setGreeted(previous => new Set(previous).add(g.href))}><Sprite facing={nearby === g ? Math.abs(position.x-g.x) > Math.abs(position.y-g.y) ? position.x > g.x ? "right" : "left" : position.y > g.y ? "down" : "up" : "down"} /></button>)}
      </>}
    </div>
    {ready && <div className={styles.controls}>
      <div className={styles.directions} role="group" aria-label="Movement controls">
        {(["up", "left", "down", "right"] as const).map(direction => <button type="button" className={`button button-secondary ${styles[direction]}`} key={direction}
          aria-label={`Move ${direction}`} onBlur={stop}
          onPointerDown={event => {
            event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId);
            held.current.set(`pointer:${event.pointerId}`, direction);
          }}
          onPointerUp={event => held.current.delete(`pointer:${event.pointerId}`)}
          onPointerCancel={stop} onLostPointerCapture={stop}
          onClick={event => { if (event.detail === 0) { setFacing(direction); const next = move(currentPosition.current, vectors[direction], 0.05); currentPosition.current = next; currentFacing.current = direction; setPosition(next); } }}>
          <span aria-hidden="true">{arrows[direction]}</span>
        </button>)}
      </div>
      <div className={styles.location}>
        <p role="status">{room}</p>
        <p className={styles.hint}>You are the blue character.</p>
        <p aria-live="polite" className={styles.hint}>{blocked ? `Use the doorway to reach ${blocked.label} Guide.` : ""}</p>
        {nearby && <button type="button" className="button" onClick={event => talk(nearby, event.currentTarget)}>Talk to {nearby.label} Guide</button>}
      </div>
      <button type="button" className="button button-secondary" onClick={entrance}>Return to entrance</button>
    </div>}
    <noscript><p>Use the links below to explore the lab.</p></noscript>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="guide-title" aria-describedby="guide-dialogue"
      onKeyDown={event => {
        if (event.key !== "Tab") return;
        const first = event.currentTarget.querySelector("a");
        const last = event.currentTarget.querySelector("button");
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}
      onCancel={event => { event.preventDefault(); closeDialogue(); }}>
      {guide && <>
        <h2 id="guide-title">{guide.label} Guide</h2>
        <p className={styles.hint}>Fictional website guide</p>
        <p id="guide-dialogue">{guide.dialogue}</p>
        <div className={styles.dialogActions}>
          <a className="button" href={guide.href}>Open {guide.label}</a>
          <button type="button" className="button button-secondary" onClick={closeDialogue}>Close</button>
        </div>
      </>}
    </dialog>
  </>;
}
