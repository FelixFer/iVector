import { AtmosphereControls } from "@/components/atmosphere";
import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/site-shell";
import Playable from "./playable";
import { guides } from "./scene-data";
import styles from "./virtual-lab.module.css";

export const metadata: Metadata = {
  title: "Virtual Lab",
  description: "Explore iVector Lab through a playable pixel-art map.",
};

export default function VirtualLabPage() {
  return <>
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <Wordmark />
        <Link href="/" className="button button-secondary">Back to Website</Link>
        <AtmosphereControls />
      </div>
    </header>
    <main className={`container ${styles.main}`} id="main" tabIndex={-1}>
      <div className={styles.heading}>
        <h1>Virtual Lab</h1>
      </div>
      <Playable />
      <nav className={styles.destinations} aria-label="Scene destinations">
        {guides.map(({ href, label }) => <Link className={styles[label.toLowerCase()]} key={href} href={href}>{label}<span aria-hidden="true">→</span></Link>)}
      </nav>
    </main>
  </>;
}
