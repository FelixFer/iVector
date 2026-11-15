import { PageAccent, type Accent } from "./page-accent";
import type { ReactNode } from "react";
import type { Resource } from "@/data/content";
import styles from "./academic-page.module.css";

export function AcademicPage({ title, accent, children }: { title: string; accent?: Accent; children: ReactNode }) {
  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.heading}><h1>{title}</h1>{accent && <PageAccent kind={accent} />}</header>
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
