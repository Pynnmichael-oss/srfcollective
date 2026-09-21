import type { Metadata } from "next";

import About from "@/components/About";
import { client } from "@/lib/sanity/client";
import { aboutSettingsQuery } from "@/lib/sanity/queries";
import type { AboutSettings } from "@/lib/sanity/types";

export const metadata: Metadata = {
  title: "About | SRF Collective",
};

export default async function AboutPage() {
  // Published content only — same as the client-wide default, stated
  // explicitly here per the project's perspective convention.
  const about = await client.fetch<AboutSettings | null>(
    aboutSettingsQuery,
    {},
    { perspective: "published" },
  );

  return <About about={about} />;
}
