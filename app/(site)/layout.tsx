import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { Bodoni_Moda, Work_Sans } from "next/font/google";
import { stegaClean } from "next-sanity";
import { VisualEditing } from "next-sanity/visual-editing";

import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PreviewBanner from "@/components/PreviewBanner";
import { sanityFetch } from "@/lib/sanity/fetch";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { SiteSettings } from "@/lib/sanity/types";

import "../../styles/globals.css";

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SRF Collective",
  description: "SRF Collective",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Footer needs siteSettings (location, Instagram link). Fetched here
  // too (page.tsx also fetches it) — Next dedupes identical fetches
  // within a request, so this isn't a duplicate network call.
  const siteSettings = await sanityFetch<SiteSettings | null>(siteSettingsQuery);
  const { isEnabled: isDraftMode } = await draftMode();

  // instagramUrl is an href, not visible text — in draft mode it may carry
  // stega's invisible characters, which would corrupt the link. footerLocation
  // stays untouched: it's rendered as visible text, so click-to-edit needs
  // its stega tagging intact.
  const footerSettings = siteSettings && {
    ...siteSettings,
    instagramUrl: stegaClean(siteSettings.instagramUrl),
  };

  return (
    <html lang="en" className={`${bodoniModa.variable} ${workSans.variable}`}>
      <body>
        {isDraftMode && <PreviewBanner />}
        <Nav />
        {children}
        <Footer siteSettings={footerSettings} />
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  );
}
