import type { Metadata } from "next";
import { AcademicPage } from "@/components/academic-page";
import styles from "@/components/academic-page.module.css";
import { loadContent } from "@/data/load-content";

export const metadata: Metadata = {
  title: "Research",
  description: "Research areas at iVector Lab.",
};

export default async function ResearchPage() {
  const { researchAreas } = await loadContent();
  return (
    <AcademicPage title="Research">
      {researchAreas.length ? (
        <ul className={styles.rows}>
          {researchAreas.map(({ id, title, description, category }) => (
            <li key={id}>
              <div className={styles.rowHeading}>
                <h2>{title}</h2>
                {category && <span className={styles.meta}>{category}</span>}
              </div>
              <p>{description}</p>
            </li>
          ))}
        </ul>
      ) : <p>No research areas listed.</p>}
    </AcademicPage>
  );
}
