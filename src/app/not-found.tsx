import Link from "next/link";
import { AcademicPage } from "@/components/academic-page";
import styles from "@/components/academic-page.module.css";
import { SiteFooter, SiteHeader } from "@/components/site-shell";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <AcademicPage title="Page not found">
          <p>The address may have changed. Use the navigation to find your page.</p>
          <div className={styles.actions}><Link className="button" href="/">Back to home</Link></div>
        </AcademicPage>
      </main>
      <SiteFooter />
    </>
  );
}
