import { DirectoryFilters } from "@/components/directory-filters";
import { RelatedRecords } from "@/components/related-records";
import { recordAnchor } from "@/data/records";
import { CopyEmail } from "@/components/page-accent";
import type { Metadata } from "next";
import Image from "next/image";
import { AcademicPage, ResourceLinks } from "@/components/academic-page";
import styles from "@/components/academic-page.module.css";
import { loadContent } from "@/data/load-content";
import { type Person } from "@/data/content";

export const metadata: Metadata = {
  title: "People",
  description: "Members of iVector Lab.",
};

export default async function PeoplePage() {
  const content = await loadContent();
  const { people } = content;
  const groups = new Map<string, Person[]>();
  for (const person of people) {
    const group = groups.get(person.role);
    if (group) group.push(person);
    else groups.set(person.role, [person]);
  }

  return (
    <AcademicPage accent="People" title="People">
      <DirectoryFilters records={people.map(record => ({ id: record.id, role: record.role }))} facets={["role"]}>
      {people.length ? Array.from(groups, ([role, members]) => (
        <section key={role} data-record-group>
          <h2>{role}</h2>
          <ul className={styles.rows}>
            {members.map(({ id, name, interests, profile, photo, studentId, email, nationality, initials }) => (
              <li key={id} id={recordAnchor(id)} data-record tabIndex={-1} className={styles.person}>
                <div className={styles.portrait}>
                  {photo ? <Image {...photo} alt={photo.alt} unoptimized /> : <span aria-hidden="true">{initials || name[0]}</span>}
                </div>
                <div>
                <h3>{name}</h3>
                {studentId && <p>Student ID: {studentId}</p>}
                {nationality && <p>{nationality}</p>}
                {email && <a className={styles.email} href={`mailto:${email}`}>{email}</a>}
                {email && <CopyEmail email={email} />}
                {interests && <p>{interests}</p>}
                {profile && <ResourceLinks links={[profile]} />}
                <RelatedRecords content={content} id={id} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )) : <p>No member profiles listed.</p>}
      </DirectoryFilters>
    </AcademicPage>
  );
}
