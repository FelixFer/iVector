"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
const Motion = createContext({ paused: true });
export function MotionProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPaused(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => { document.documentElement.dataset.motionPaused = String(paused); }, [paused]);
  return <Motion.Provider value={{ paused }}>{children}</Motion.Provider>;
}
export function useSceneMotion() {
  const { paused } = useContext(Motion);
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
  return { ref, active: !paused && visible && foreground, visible, foreground };
}
export function WorkspaceAmbience() {
  const { ref, active } = useSceneMotion();
  return <div ref={ref} className="workspace-ambience" aria-hidden="true" data-active={active}>
    <svg viewBox="0 0 120 90" shapeRendering="crispEdges"><defs><clipPath id="cloud-window"><path d="M76 12h13v8H76zM91 12h13v8H91z" /></clipPath></defs><g clipPath="url(#cloud-window)"><path className="pixel-cloud" fill="#fff7e9" d="M69 16h2v-1h3v1h2v2h-7z" /></g></svg>
  </div>;
}
