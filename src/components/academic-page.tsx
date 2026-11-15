import type { ReactNode } from "react";
import type { Resource } from "@/data/content";
import styles from "./academic-page.module.css";

export function AcademicPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={`container ${styles.page}`}>
      <h1>{title}</h1>
      {children}
    </div>
  );
}

export function ResourceLinks({ links }: { links?: readonly Resource[] }) {
  if (!links?.length) return null;

  return (
    <ul className={styles.resources} aria-label="Resources">
      {links.map(({ href, label }) => (
        <li key={href}><a href={href}>{label}</a></li>
      ))}
    </ul>
  );
}
