"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAtmosphere } from "./atmosphere";
const Motion = createContext({ paused: true, ready: false });
export function MotionProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(true);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setPaused(query.matches); setReady(true); };
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => { document.documentElement.dataset.motionPaused = String(paused); }, [paused]);
  return <Motion.Provider value={{ paused, ready }}>{children}</Motion.Provider>;
}
export function useSceneMotion() {
  const { paused, ready } = useContext(Motion);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false), [foreground, setForeground] = useState(false);
  useEffect(() => {
    const node = ref.current;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (node) observer.observe(node);
    const update = () => setForeground(!document.hidden);
    update(); document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);
  return { ref, active: ready && !paused && visible && foreground, visible, foreground, paused, ready };
}
export function WorkspaceAmbience() {
  const { ref, active, visible, foreground, paused, ready } = useSceneMotion();
  const atmosphere = useAtmosphere();
  const [phase, setPhase] = useState("idle");
  useEffect(() => {
    if (!ready || !atmosphere.ready) return;
    let next = phase;
    if (paused) next = "settled";
    else if (phase === "idle" && visible && foreground && atmosphere.lighting === "day") next = "running";
    else if (phase === "running" && (!visible || !foreground || atmosphere.lighting === "night")) next = "settled";
    if (next === phase) return;
    let cancelled = false;
    queueMicrotask(() => { if (!cancelled) setPhase(next); });
    return () => { cancelled = true; };
  }, [ready, atmosphere.ready, atmosphere.lighting, paused, visible, foreground, phase]);
  return <div ref={ref} className="workspace-ambience" aria-hidden="true" data-active={active} data-cloud-state={phase}>
    <svg viewBox="0 0 120 90" shapeRendering="crispEdges"><defs><clipPath id="cloud-window"><path d="M76 12h13v8H76zM91 12h13v8H91z" /></clipPath></defs><g clipPath="url(#cloud-window)"><path onAnimationEnd={() => setPhase("settled")} className="pixel-cloud" fill="#fff7e9" d="M77 16h2v-1h3v1h2v2h-7z" /></g></svg>
  </div>;
}
