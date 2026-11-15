import { MotionProvider } from "@/components/motion";
import type { Metadata } from "next";
import "@fontsource/pixelify-sans/700.css";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: { default: `${site.name} · NDHU`, template: `%s · ${site.name}` },
  description: `${site.name}, ${site.department}, ${site.university}.`,
  robots: { index: false, follow: false },
  openGraph: { type: "website", siteName: site.name },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
