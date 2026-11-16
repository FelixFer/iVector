import { DirectoryFilters } from "@/components/directory-filters";
import { RelatedRecords } from "@/components/related-records";
import { recordAnchor } from "@/data/records";
import type { Metadata } from "next";
import { AcademicPage, ResourceLinks } from "@/components/academic-page";
import styles from "@/components/academic-page.module.css";
import { loadContent } from "@/data/load-content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Projects and related resources from iVector Lab.",
};

export default async function ProjectsPage() {
  const content = await loadContent();
  const { projects } = content;
  return (
    <AcademicPage accent="Projects" title="Projects">
      <DirectoryFilters records={projects.map(record => ({ id: record.id, category: record.category, year: record.year }))} facets={["category","year"]}>
      {projects.length ? (
        <ul className={styles.rows}>
          {projects.map(({ id, title, subtitle, description, year, category, links }) => (
            <li key={id} id={recordAnchor(id)} data-record tabIndex={-1}>
              <div className={styles.rowHeading}>
                <h2>{title}</h2>
                {year && <span className={styles.meta}>{year}</span>}
              </div>
              {subtitle && <p><strong>{subtitle}</strong></p>}
              <p>{description}</p>
              {category && <p className={styles.meta}>{category}</p>}
              <ResourceLinks links={links} />
              <RelatedRecords content={content} id={id} />
            </li>
          ))}
        </ul>
      ) : <p>No projects listed.</p>}
      </DirectoryFilters>
    </AcademicPage>
  );
}
