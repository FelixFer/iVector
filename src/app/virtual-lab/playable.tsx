"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { guideNear, guides, hasLineOfSight, move, roomAt, spawn, vectors, type Direction, type Guide } from "./scene-data";
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
  const scene = useRef<HTMLDivElement>(null);
  const origin = useRef<HTMLElement | null>(null);
  const nearby = guideNear(position);
  const room = roomAt(position);

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
  }, [ready]);
  useEffect(() => {
    let frame = 0, last = 0;
    const inputs = held.current;
    const cancel = () => { held.current.clear(); setWalking(false); };
    const tick = (time: number) => {
      if (!last) setReady(true);
      const seconds = last ? (time - last) / 1000 : 0;
      last = time;
      let x = 0, y = 0;
      held.current.forEach(direction => { x += vectors[direction].x; y += vectors[direction].y; });
      const moving = (x !== 0 || y !== 0) && !dialog.current?.open;
      setWalking(moving);
      if (moving) {
        setFacing(x ? x > 0 ? "right" : "left" : y > 0 ? "down" : "up");
        setPosition(current => move(current, { x, y }, seconds));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const release = (event: KeyboardEvent) => held.current.delete(`key:${event.key.toLowerCase()}`);
    window.addEventListener("keyup", release); window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", cancel);
    return () => {
      cancelAnimationFrame(frame); inputs.clear();
      window.removeEventListener("keyup", release); window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", cancel);
    };
  }, []);
  return <>
    <p id="walk-instructions" className={styles.instructions}>
      <span className={styles.keyboardPrompt}>Arrow keys / WASD to move. E or click a guide to talk.</span>
      <span className={styles.touchPrompt}>Use the direction buttons to move. Tap a guide to talk.</span>
    </p>
    <div ref={scene} className={styles.scene} role="group" tabIndex={ready ? 0 : undefined}
      aria-label="Walk around the lab" aria-describedby="walk-instructions"
      onBlur={stop} onPointerDown={event => { if (event.target === event.currentTarget) scene.current?.focus(); }}
      onKeyDown={event => {
        if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
        const key = event.key.toLowerCase();
        if (keys[key]) { event.preventDefault(); held.current.set(`key:${key}`, keys[key]); }
        if (key === "e" && nearby && !event.repeat) { event.preventDefault(); talk(nearby, event.currentTarget); }
      }}>
      <Image src="/art/lab-map.svg" alt="" width={960} height={560} unoptimized preload />
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
          onClick={event => talk(g, event.currentTarget)}><Sprite /></button>)}
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
          onClick={event => { if (event.detail === 0) { setFacing(direction); setPosition(current => move(current, vectors[direction], 0.05)); } }}>
          <span aria-hidden="true">{arrows[direction]}</span>
        </button>)}
      </div>
      <div className={styles.location}>
        <p role="status">{room}</p>
        <p className={styles.hint}>You are the blue character.</p>
        {nearby && <button type="button" className="button" onClick={event => talk(nearby, event.currentTarget)}>Talk to {nearby.label} Guide</button>}
      </div>
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
