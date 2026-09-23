import type { Metadata } from "next";
import { stegaClean } from "next-sanity";

import About from "@/components/About";
import { sanityFetch } from "@/lib/sanity/fetch";
import { aboutSettingsQuery } from "@/lib/sanity/queries";
import type { AboutSettings } from "@/lib/sanity/types";

export const metadata: Metadata = {
  title: "About | SRF Collective",
};

export default async function AboutPage() {
  const about = await sanityFetch<AboutSettings | null>(aboutSettingsQuery);

  // portrait's asset ref and portraitAlt are used to build an image URL and
  // an <img alt> attribute, not shown as visible text — stega's invisible
  // tagging (draft mode only) would corrupt both, so it's cleaned here.
  // statement/founderIntro/body stay untouched: they're rendered as visible
  // text, and click-to-edit needs that tagging intact.
  const cleanedAbout = about && {
    ...about,
    portrait: about.portrait && { ...about.portrait, asset: stegaClean(about.portrait.asset) },
    portraitAlt: stegaClean(about.portraitAlt),
  };

  return <About about={cleanedAbout} />;
}
