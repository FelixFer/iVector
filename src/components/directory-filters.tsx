"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { recordAnchor } from "@/data/records";
import { facetOptions, matchesFilters, type Facet, type FilterRecord, type Selection } from "./directory-filtering";
import styles from "./directory-filters.module.css";

const labels: Record<Facet, string> = { category: "Category", year: "Year", role: "Role" };

export function DirectoryFilters({ records, facets, children }: { records: readonly FilterRecord[]; facets: readonly Facet[]; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const [ready, setReady] = useState(false);
  const [selection, setSelection] = useState<Selection>({});
  const options = facets.map(facet => ({ facet, values: facetOptions(records, facet) })).filter(({ values }) => values.length >= 2);
  const count = records.filter(record => matchesFilters(record, selection)).length;

  useEffect(() => { const frame = requestAnimationFrame(() => setReady(true)); return () => cancelAnimationFrame(frame); }, []);
  useEffect(() => {
    const container = root.current;
    if (!container) return;
    for (const record of records) {
      const row = document.getElementById(recordAnchor(record.id));
      if (row && container.contains(row)) row.hidden = !matchesFilters(record, selection);
    }
    container.querySelectorAll<HTMLElement>("[data-record-group]").forEach(group => {
      group.hidden = !group.querySelector("[data-record]:not([hidden])");
    });
  }, [records, selection]);

  useEffect(() => {
    let frame = 0;
    function reveal(fragment: string) {
      let anchor: string;
      try { anchor = decodeURIComponent(fragment.slice(1)); } catch { return; }
      const target = document.getElementById(anchor);
      if (!target?.hasAttribute("data-record") || !root.current?.contains(target)) return;
      // Fragment navigation must reach a record even if an earlier filter hid it.
      setSelection({});
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { target.scrollIntoView(); target.focus({ preventScroll: true }); });
    }
    const onHashChange = () => reveal(location.hash);
    function onLink(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href);
      if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash) reveal(url.hash);
    }
    onHashChange(); window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onLink);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange", onHashChange); document.removeEventListener("click", onLink); };
  }, []);

  return <div ref={root} className={styles.directory}>
    {ready && options.length > 0 && <div className={styles.filters} role="group" aria-label="Directory filters">
      {options.map(({ facet, values }) => <label key={facet} htmlFor={`${id}-${facet}`}>
        {labels[facet]}
        <select id={`${id}-${facet}`} value={selection[facet] || ""} onChange={event => setSelection(previous => ({ ...previous, [facet]: event.target.value }))}>
          <option value="">All {facet === "category" ? "categories" : `${facet}s`}</option>
          {values.map(value => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>)}
      <button type="button" className="button button-secondary" disabled={!Object.values(selection).some(Boolean)} onClick={() => setSelection({})}>Reset filters</button>
      <p role="status">{count} of {records.length} records</p>
    </div>}
    {ready && options.length > 0 && count === 0 && <p className={styles.empty}>No matching records.</p>}
    {children}
  </div>;
}
