import type { Metadata } from "next";
import { AcademicPage, ResourceLinks } from "@/components/academic-page";
import styles from "@/components/academic-page.module.css";
import { loadContent } from "@/data/load-content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Projects and related resources from iVector Lab.",
};

export default async function ProjectsPage() {
  const { projects } = await loadContent();
  return (
    <AcademicPage accent="Projects" title="Projects">
      {projects.length ? (
        <ul className={styles.rows}>
          {projects.map(({ id, title, subtitle, description, year, category, links }) => (
            <li key={id}>
              <div className={styles.rowHeading}>
                <h2>{title}</h2>
                {year && <span className={styles.meta}>{year}</span>}
              </div>
              {subtitle && <p><strong>{subtitle}</strong></p>}
              <p>{description}</p>
              {category && <p className={styles.meta}>{category}</p>}
              <ResourceLinks links={links} />
            </li>
          ))}
        </ul>
      ) : <p>No projects listed.</p>}
    </AcademicPage>
  );
}
