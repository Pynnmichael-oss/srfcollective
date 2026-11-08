import type { Metadata } from "next";
import { stegaClean } from "next-sanity";

import About from "@/components/About";
import BehindTheScenes from "@/components/BehindTheScenes";
import { sanityFetch } from "@/lib/sanity/fetch";
import { aboutSettingsQuery } from "@/lib/sanity/queries";
import type { AboutSettings } from "@/lib/sanity/types";

export const revalidate = 60

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
  //
  // The behind-the-scenes photos get the same treatment, plus _key, which
  // goes into a React key where invisible characters would mean a changing
  // key on every render.
  const cleanedAbout = about && {
    ...about,
    portrait: about.portrait && { ...about.portrait, asset: stegaClean(about.portrait.asset) },
    portraitAlt: stegaClean(about.portraitAlt),
    behindTheScenes: about.behindTheScenes?.map((photo) => ({
      ...photo,
      _key: stegaClean(photo._key),
      asset: photo.asset && stegaClean(photo.asset),
      alt: stegaClean(photo.alt),
    })),
  };

  return (
    <>
      <About about={cleanedAbout} />
      <BehindTheScenes photos={cleanedAbout?.behindTheScenes ?? []} />
    </>
  );
}
