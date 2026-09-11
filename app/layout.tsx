import type { Metadata } from "next";
import { Bodoni_Moda, Work_Sans } from "next/font/google";

import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { client } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { SiteSettings } from "@/lib/sanity/types";

import "../styles/globals.css";

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
  const siteSettings = await client.fetch<SiteSettings | null>(siteSettingsQuery);

  return (
    <html lang="en" className={`${bodoniModa.variable} ${workSans.variable}`}>
      <body>
        <Nav />
        {children}
        <Footer siteSettings={siteSettings} />
      </body>
    </html>
  );
}
