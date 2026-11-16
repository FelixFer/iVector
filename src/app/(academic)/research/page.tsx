import { DirectoryFilters } from "@/components/directory-filters";
import { RelatedRecords } from "@/components/related-records";
import { recordAnchor } from "@/data/records";
import type { Metadata } from "next";
import { AcademicPage } from "@/components/academic-page";
import styles from "@/components/academic-page.module.css";
import { loadContent } from "@/data/load-content";

export const metadata: Metadata = {
  title: "Research",
  description: "Research areas at iVector Lab.",
};

export default async function ResearchPage() {
  const content = await loadContent();
  const { researchAreas } = content;
  return (
    <AcademicPage accent="Research" title="Research">
      <DirectoryFilters records={researchAreas.map(record => ({ id: record.id, category: record.category }))} facets={["category"]}>
      {researchAreas.length ? (
        <ul className={styles.rows}>
          {researchAreas.map(({ id, title, description, category }) => (
            <li key={id} id={recordAnchor(id)} data-record tabIndex={-1}>
              <div className={styles.rowHeading}>
                <h2>{title}</h2>
                {category && <span className={styles.meta}>{category}</span>}
              </div>
              <p>{description}</p>
              <RelatedRecords content={content} id={id} />
            </li>
          ))}
        </ul>
      ) : <p>No research areas listed.</p>}
      </DirectoryFilters>
    </AcademicPage>
  );
}
