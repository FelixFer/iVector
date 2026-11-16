import { DirectoryFilters } from "@/components/directory-filters";
import { RelatedRecords } from "@/components/related-records";
import { recordAnchor } from "@/data/records";
import type { Metadata } from "next";
import { AcademicPage, ResourceLinks } from "@/components/academic-page";
import styles from "@/components/academic-page.module.css";
import { loadContent } from "@/data/load-content";

export const metadata: Metadata = {
  title: "Publications",
  description: "The iVector Lab publication archive.",
};

export default async function PublicationsPage() {
  const content = await loadContent();
  const { publications } = content;
  return (
    <AcademicPage accent="Publications" title="Publications">
      <DirectoryFilters records={publications.map(record => ({ id: record.id, year: record.year }))} facets={["year"]}>
      {publications.length ? (
        <ul className={styles.rows}>
          {publications.toSorted((first, second) => second.year - first.year)
            .map(({ id, title, authors, venue, year, paper }) => (
              <li key={id} id={recordAnchor(id)} data-record tabIndex={-1}>
                <div className={styles.rowHeading}>
                  <h2 className={styles.publicationTitle}>{title}</h2>
                  <span className={styles.meta}>{year}</span>
                </div>
                <p>{authors.join(", ")}</p>
                <p><cite>{venue}</cite></p>
                {paper && <ResourceLinks links={[paper]} />}
                <RelatedRecords content={content} id={id} />
              </li>
            ))}
        </ul>
      ) : <p>No publications listed.</p>}
      </DirectoryFilters>
    </AcademicPage>
  );
}
