import Link from "next/link";
import { navigation, site } from "@/data/site";
import PrimaryNav from "./primary-nav";
import styles from "./site-shell.module.css";

export function Wordmark() {
  return <Link href="/" className={styles.wordmark}>{site.name}</Link>;
}

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <div className={styles.identity}>
          <Wordmark />
          <span className={styles.affiliation}>NDHU CSIE</span>
        </div>
        <PrimaryNav />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerInner}`}>
        <div className={styles.footerIdentity}>
          <Wordmark />
          <p>{site.department}<br />{site.university}<br />{site.location}</p>
        </div>
        <nav aria-label="Footer">
          {navigation.slice(1).map(({ href, label }) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
