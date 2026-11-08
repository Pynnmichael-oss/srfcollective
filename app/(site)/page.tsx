import { stegaClean } from "next-sanity";

import Activations from "@/components/Activations";
import ClosingCta from "@/components/ClosingCta";
import Hero from "@/components/Hero";
import PressMarquee from "@/components/PressMarquee";
import WorkGrid from "@/components/WorkGrid";
import { sanityFetch } from "@/lib/sanity/fetch";
import { coverTiles } from "@/lib/sanity/media";
import { cleanPartner, cleanPressLogo, cleanProject } from "@/lib/sanity/stega";
import {
  featuredProjectsQuery,
  partnersQuery,
  pressLogosQuery,
  siteSettingsQuery,
} from "@/lib/sanity/queries";
import type { Partner, PressLogo, Project, SiteSettings } from "@/lib/sanity/types";

// Content she publishes in Studio has to reach the site without a redeploy.
// Every page here is prerendered, so without this the HTML is frozen at
// build time: she could publish a photo and nothing would change until
// someone pushed code. Next revalidates at most once every 60 seconds, on
// the first request after that window — so a publish shows up within about
// a minute, and visitors still get static HTML.
export const revalidate = 60


export default async function Home() {
  const [siteSettings, featuredProjects, pressLogos, partners] = await Promise.all([
    sanityFetch<SiteSettings | null>(siteSettingsQuery),
    // GROQ's []-> on an entirely unset featuredProjects field returns null,
    // not [] — Rosie hasn't curated any picks yet in the current dataset,
    // so this is the live default state, not just an edge case.
    sanityFetch<Project[] | null>(featuredProjectsQuery).then((projects) => projects ?? []),
    sanityFetch<PressLogo[]>(pressLogosQuery),
    sanityFetch<Partner[]>(partnersQuery),
  ]);

  // siteSettings is a singleton that's always seeded, so this shouldn't
  // happen — but per the standing null-guard constraint, fail gracefully:
  // sections that depend on it (Hero, Activations' heading/lede) simply
  // omit that copy instead of crashing; WorkGrid and PressMarquee don't
  // depend on siteSettings at all, so they render normally either way.
  return (
    <>
      <Hero headline={siteSettings?.heroHeadline} subline={siteSettings?.heroSubline} />
      {/* One cover per highlighted project, so "up to 9 highlights" stays
          9 tiles however many photos each project holds. /work shows every
          item — see lib/sanity/media.ts. */}
      <WorkGrid
        tiles={coverTiles(featuredProjects.map(cleanProject))}
        viewAllHref="/work"
        label="Featured Work"
      />
      <PressMarquee pressLogos={pressLogos.map(cleanPressLogo)} />
      <Activations
        heading={siteSettings?.activationsHeading}
        lede={siteSettings?.activationsLede}
        partners={partners.map(cleanPartner)}
      />
      {/* contactEmail is both visible text and built into a mailto: href —
          the same tension the instagramUrl comment above describes for the
          footer — so it's cleaned like a URL rather than left as visible
          copy, or stega's invisible characters would break the link. */}
      <ClosingCta
        ctaHeading={siteSettings?.ctaHeading}
        contactEmail={siteSettings?.contactEmail && stegaClean(siteSettings.contactEmail)}
      />
    </>
  );
}
