"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useId, useRef, useState, type ReactNode } from "react";
import { atmosphereKey, defaultAtmosphere, readAtmosphere, taiwanLighting, type AtmospherePreference, type Lighting } from "./atmosphere-preference";
import styles from "./atmosphere.module.css";

const Atmosphere = createContext({ ready: false, preference: defaultAtmosphere, lighting: "day" as Lighting, choose: (() => {}) as (value: AtmospherePreference) => void });

export function AtmosphereProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState(defaultAtmosphere);
  const [automatic, setAutomatic] = useState<Lighting>("day");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => {
      let saved = defaultAtmosphere;
      try { saved = readAtmosphere(localStorage.getItem(atmosphereKey)); } catch {}
      if (saved.mode === "automatic") setAutomatic(taiwanLighting(new Date()));
      setPreference(saved); setReady(true);
    };
    const storage = (event: StorageEvent) => { if (event.key === atmosphereKey || event.key === null) sync(); };
    sync(); window.addEventListener("storage", storage);
    return () => window.removeEventListener("storage", storage);
  }, []);
  useEffect(() => {
    if (preference.mode !== "automatic") return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const update = () => {
      if (timer) clearInterval(timer);
      if (!document.hidden) { setAutomatic(taiwanLighting(new Date())); timer = setInterval(() => setAutomatic(taiwanLighting(new Date())), 60_000); }
    };
    update(); document.addEventListener("visibilitychange", update);
    return () => { if (timer) clearInterval(timer); document.removeEventListener("visibilitychange", update); };
  }, [preference.mode]);
  const lighting = preference.mode === "manual" ? preference.lighting : automatic;
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!ready || root.dataset.atmosphere === lighting) return;
    root.dataset.themeChanging = "true";
    root.dataset.atmosphere = lighting;
    let painted = 0;
    const frame = requestAnimationFrame(() => { painted = requestAnimationFrame(() => { delete root.dataset.themeChanging; }); });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(painted); delete root.dataset.themeChanging; };
  }, [lighting, ready]);
  function choose(value: AtmospherePreference) {
    if (value.mode === "automatic") setAutomatic(taiwanLighting(new Date()));
    setPreference(value);
    try { localStorage.setItem(atmosphereKey, JSON.stringify(value)); } catch {}
  }
  return <Atmosphere.Provider value={{ ready, preference, lighting, choose }}>{children}</Atmosphere.Provider>;
}

export function useAtmosphere() { return useContext(Atmosphere); }

export function AtmosphereControls() {
  const { ready, preference, lighting, choose } = useContext(Atmosphere);
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!open) return;
    function place() {
      const button = trigger.current, popup = panel.current;
      if (!button || !popup) return;
      const box = button.getBoundingClientRect();
      if (box.bottom <= 0 || box.top >= innerHeight) { popup.hidePopover(); return; }
      const width = Math.min(260, innerWidth - 24);
      popup.style.left = `${Math.max(12, Math.min(box.right - width, innerWidth - width - 12))}px`;
      popup.style.top = `${box.bottom + 8}px`;
      popup.style.width = `${width}px`;
      popup.style.maxHeight = `${Math.max(0, innerHeight - box.bottom - 20)}px`;
    }
    place(); window.addEventListener("resize", place); window.addEventListener("scroll", place, true);
    return () => { window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [open]);
  const selected = preference.mode === "automatic" ? "automatic" : lighting;
  return <div className={styles.slot}>
    {ready && <div className={styles.controls} role="group" aria-label="Atmosphere">
      <button type="button" role="switch" aria-label="Night atmosphere" aria-checked={lighting === "night"} className={styles.switch} onClick={() => choose({ ...preference, mode: "manual", lighting: lighting === "day" ? "night" : "day" })}>
        <span className={styles.thumb} aria-hidden="true"><svg viewBox="0 0 16 16" shapeRendering="crispEdges"><path fill="currentColor" d={lighting === "day" ? "M6 4h4v1h1v1h1v4h-1v1h-1v1H6v-1H5v-1H4V6h1V5h1zM7 0h2v2H7zM7 14h2v2H7zM0 7h2v2H0zM14 7h2v2h-2zM2 2h2v2H2zm10 0h2v2h-2zM2 12h2v2H2zm10 0h2v2h-2z" : "M5 1h5v2H7v2H5v5h2v2h5v-2h2v3h-2v2H5v-2H3v-3H1V5h2V3h2z"} /></svg></span>
      </button>
      <button type="button" ref={trigger} className={styles.picker} aria-label="Choose atmosphere" aria-expanded={open} aria-controls={id} popoverTarget={id}>
        <svg width="22" height="22" viewBox="0 0 20 20" aria-hidden="true" shapeRendering="crispEdges"><path fill="currentColor" d="M3 2h12v2h2v10h-5v4H3V2zm2 2v12h5v-4h5V4z"/><path fill="#91b9cd" d="M6 5h3v3H6z"/><path fill="#a8bb94" d="M11 5h3v3h-3z"/><path fill="#c7a5ba" d="M6 10h3v3H6z"/>{preference.mode === "automatic" && <g><path fill="var(--color-paper)" d="M12 11h8v9h-8z"/><path fill="currentColor" d="M13 12h6v7h-6zm1 1v5h4v-5zm1 1h1v2h1v1h-2z"/></g>}</svg>
      </button>
      <div ref={panel} id={id} popover="auto" className={styles.panel} onToggle={event => setOpen(event.newState === "open")} onKeyDown={event => { if (event.key === "Escape") trigger.current?.focus(); }}>
        <fieldset><legend>Atmosphere</legend>{(["day", "night", "automatic"] as const).map(value => <label key={value}><input type="radio" name={id} checked={selected === value} onChange={() => choose(value === "automatic" ? { ...preference, mode: "automatic" } : { ...preference, mode: "manual", lighting: value })} />{value === "day" ? "Day" : value === "night" ? "Night" : "Automatic"}</label>)}</fieldset>
      </div>
    </div>}
  </div>;
}
