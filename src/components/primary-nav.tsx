"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { navigation } from "@/data/site";
import styles from "./site-shell.module.css";

export default function PrimaryNav() {
  const pathname = usePathname();
  const disclosure = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);

  function links(items: ReadonlyArray<(typeof navigation)[number]>, closeMenu = false) {
    return items.map(({ href, label }) => (
      <Link
        key={href}
        href={href}
        aria-current={pathname.replace(/\/$/, "") === href.replace(/\/$/, "") ? "page" : undefined}
        className={href === "/virtual-lab/" ? styles.labLink : undefined}
        onNavigate={closeMenu ? () => disclosure.current?.removeAttribute("open") : undefined}
      >
        {label}
      </Link>
    ));
  }

  return (
    <>
      <nav className={styles.desktopNav} aria-label="Primary">
        <div className={styles.navLinks}>{links(navigation.slice(0, -1))}</div>
        {links(navigation.slice(-1))}
      </nav>
      <details
        className={styles.mobileNav}
        ref={disclosure}
        onKeyDown={(event) => {
          if (event.key === "Escape" && disclosure.current?.open) {
            disclosure.current.open = false;
            summary.current?.focus();
          }
        }}
      >
        <summary ref={summary}>
          Menu
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </summary>
        <nav aria-label="Primary">{links(navigation, true)}</nav>
      </details>
    </>
  );
}
