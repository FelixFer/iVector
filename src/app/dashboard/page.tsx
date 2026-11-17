import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import Dashboard from "@/components/dashboard/dashboard";
import styles from "@/components/dashboard/dashboard.module.css";

export const metadata: Metadata = {
  title: "Staff dashboard",
  description: "Staff editing for iVector Lab academic content.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className={`container ${styles.page}`}>
        <header className={styles.heading}>
          <h1>Staff dashboard</h1>
          <p>Edit academic content. Published changes appear on the website after its next build and deployment.</p>
        </header>
        <noscript><p>JavaScript is required for staff sign-in and editing. Public pages remain available.</p></noscript>
        <Dashboard />
      </main>
      <SiteFooter />
    </>
  );
}
