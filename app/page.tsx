import Activations from "@/components/Activations";
import Hero from "@/components/Hero";
import PressMarquee from "@/components/PressMarquee";
import WorkGrid from "@/components/WorkGrid";
import { client } from "@/lib/sanity/client";
import {
  partnersQuery,
  pressLogosQuery,
  projectsQuery,
  siteSettingsQuery,
} from "@/lib/sanity/queries";
import type { Partner, PressLogo, Project, SiteSettings } from "@/lib/sanity/types";

export default async function Home() {
  const [siteSettings, projects, pressLogos, partners] = await Promise.all([
    client.fetch<SiteSettings | null>(siteSettingsQuery),
    client.fetch<Project[]>(projectsQuery),
    client.fetch<PressLogo[]>(pressLogosQuery),
    client.fetch<Partner[]>(partnersQuery),
  ]);

  // siteSettings is a singleton that's always seeded, so this shouldn't
  // happen — but per the standing null-guard constraint, fail gracefully:
  // sections that depend on it (Hero, Activations' heading/lede) simply
  // omit that copy instead of crashing; WorkGrid and PressMarquee don't
  // depend on siteSettings at all, so they render normally either way.
  return (
    <>
      <Hero headline={siteSettings?.heroHeadline} subline={siteSettings?.heroSubline} />
      <WorkGrid projects={projects} />
      <PressMarquee pressLogos={pressLogos} />
      <Activations
        heading={siteSettings?.activationsHeading}
        lede={siteSettings?.activationsLede}
        partners={partners}
      />
    </>
  );
}
