import type { Metadata } from "next";
import { AcademicPage, ResourceLinks } from "@/components/academic-page";
import styles from "@/components/academic-page.module.css";
import { loadContent } from "@/data/load-content";

export const metadata: Metadata = {
  title: "Publications",
  description: "The iVector Lab publication archive.",
};

export default async function PublicationsPage() {
  const { publications } = await loadContent();
  return (
    <AcademicPage accent="Publications" title="Publications">
      {publications.length ? (
        <ul className={styles.rows}>
          {publications.toSorted((first, second) => second.year - first.year)
            .map(({ id, title, authors, venue, year, paper }) => (
              <li key={id}>
                <div className={styles.rowHeading}>
                  <h2 className={styles.publicationTitle}>{title}</h2>
                  <span className={styles.meta}>{year}</span>
                </div>
                <p>{authors.join(", ")}</p>
                <p><cite>{venue}</cite></p>
                {paper && <ResourceLinks links={[paper]} />}
              </li>
            ))}
        </ul>
      ) : <p>No publications listed.</p>}
    </AcademicPage>
  );
}
