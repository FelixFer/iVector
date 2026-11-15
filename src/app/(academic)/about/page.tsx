import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AcademicPage } from "@/components/academic-page";
import styles from "@/components/academic-page.module.css";
import { loadContent } from "@/data/load-content";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description: "About iVector Lab at National Dong Hwa University.",
};

export default async function AboutPage() {
  const { about } = await loadContent();
  return (
    <AcademicPage title="About iVector Lab">
      <section aria-label="Lab identity">
        <p>{site.name} · {site.department}<br />{site.university} · {site.location}</p>
        {about.introduction && <p>{about.introduction}</p>}
      </section>
      {(about.vision || about.mission) && (
        <section>
          <h2>Vision and mission</h2>
          {about.vision && <p>{about.vision}</p>}
          {about.mission && <p>{about.mission}</p>}
        </section>
      )}
      {about.philosophy && <section><h2>Research philosophy</h2><p>{about.philosophy}</p></section>}
      {about.environmentPhoto && (
        <section>
          <h2>Our environment</h2>
          <Image {...about.environmentPhoto} alt={about.environmentPhoto.alt} unoptimized />
        </section>
      )}
      <div className={styles.actions}>
        <Link className="button" href="/research/">Explore research</Link>
        <Link className="button button-secondary" href="/people/">Meet the lab</Link>
      </div>
    </AcademicPage>
  );
}
