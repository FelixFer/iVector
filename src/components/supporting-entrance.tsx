"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSceneMotion } from "./motion";
import styles from "./supporting-entrance.module.css";

export function SupportingEntrance({ children }: { children: ReactNode }) {
  const { ref, ready, paused, visible, foreground } = useSceneMotion();
  const [phase, setPhase] = useState("idle");
  useEffect(() => {
    const reveal = () => {
      let target: HTMLElement | null = null;
      try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch {}
      if (target && ref.current?.contains(target)) setPhase("settled");
    };
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, [ref]);
  useEffect(() => {
    if (!ready) return;
    const node = ref.current;
    let target: HTMLElement | null = null;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch {}
    const direct = Boolean(node && (node.contains(document.activeElement) || target && node.contains(target)));
    const next = paused || direct || phase === "running" && (!visible || !foreground) ? "settled" : phase === "idle" && visible && foreground ? "running" : phase;
    if (next === phase) return;
    let cancelled = false;
    queueMicrotask(() => { if (!cancelled) setPhase(next); });
    return () => { cancelled = true; };
  }, [ready, paused, visible, foreground, phase, ref]);
  return <div ref={ref} className={styles.entrance} data-about-motion={phase} onAnimationEnd={() => setPhase("settled")} onFocusCapture={() => setPhase("settled")}>{children}</div>;
}
