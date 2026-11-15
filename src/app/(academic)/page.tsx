import { WorkspaceAmbience } from "@/components/motion";
import Image from "next/image";
import Link from "next/link";
import { loadContent } from "@/data/load-content";
import { navigation, site } from "@/data/site";
import styles from "./home.module.css";

export default async function HomePage() {
  const { about, homeIntroduction, projects, researchAreas } = await loadContent();
  return (
    <>
      <section className={`container ${styles.hero}`} aria-labelledby="welcome">
        <div className={styles.heroCopy}>
          <h1 id="welcome">Welcome to<br />iVector Lab</h1>
          <p className={styles.intro}>
            {homeIntroduction.text ?? `${site.department}, ${site.university}.`}
          </p>
          <p className={styles.location}>{site.location}</p>
          <div className={styles.actions}>
            <Link className={`button ${styles.enterLab}`} href="/virtual-lab/">
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" shapeRendering="crispEdges">
                <path fill="currentColor" d="M2 1h2v2h2v2h2v2H6v2H4v2H2z" />
              </svg>
              Enter Virtual Lab
            </Link>
            <Link className="button button-secondary" href="/research/">Explore Research</Link>
          </div>
        </div>
        <div>
        <figure className={styles.illustration}>
          <Image src="/art/workspace.svg" width={480} height={360} alt="" unoptimized preload />
        <WorkspaceAmbience />
        </figure>
        </div>
      </section>

      {researchAreas.length > 0 && (
        <section className={`container ${styles.section}`}>
          <h2>Research areas</h2>
          <ul className={styles.previews}>
            {researchAreas.slice(0, 3).map(({ id, title, description }) => (
              <li key={id}><h3>{title}</h3><p>{description}</p></li>
            ))}
          </ul>
          <Link href="/research/">All research areas</Link>
        </section>
      )}
      {projects.length > 0 && (
        <section className={`container ${styles.section}`}>
          <h2>Selected projects</h2>
          <ul className={styles.previews}>
            {projects.slice(0, 3).map(({ id, title, description }) => (
              <li key={id}><h3>{title}</h3><p>{description}</p></li>
            ))}
          </ul>
          <Link href="/projects/">All projects</Link>
        </section>
      )}
      {about.introduction && (
        <section className={`container ${styles.section}`}>
          <h2>About the lab</h2>
          <p>{about.introduction}</p>
          <Link href="/about/">About iVector Lab</Link>
        </section>
      )}

      <section className={styles.explore}>
        <div className="container">
          <h2>Explore iVector Lab</h2>
          <ul className={styles.directory}>
            {navigation.slice(1).map(({ href, label }) => (
              <li key={href}>
                <Link href={href}>
                  {label}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h9m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
