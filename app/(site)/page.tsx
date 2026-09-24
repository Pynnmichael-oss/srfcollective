import { stegaClean } from "next-sanity";

import Activations from "@/components/Activations";
import Hero from "@/components/Hero";
import PressMarquee from "@/components/PressMarquee";
import WorkGrid from "@/components/WorkGrid";
import { sanityFetch } from "@/lib/sanity/fetch";
import {
  featuredProjectsQuery,
  partnersQuery,
  pressLogosQuery,
  siteSettingsQuery,
} from "@/lib/sanity/queries";
import type {
  Partner,
  PressLogo,
  Project,
  SanityImage,
  SiteSettings,
} from "@/lib/sanity/types";

// In draft mode, stega tags editable strings with invisible characters.
// That's exactly what makes click-to-edit work for VISIBLE text (client
// name, category, headline, lede — left untouched below), but the same
// tagging would corrupt a value used for logic or built into a URL/attribute
// rather than displayed as-is. Cleaned here, once, right after the fetch —
// WorkTile/PressMarquee/Activations never need to know draft mode exists.
function cleanImage(image: SanityImage | undefined): SanityImage | undefined {
  if (!image) return image;
  return { ...image, asset: stegaClean(image.asset) };
}

function cleanProject(project: Project): Project {
  return {
    ...project,
    _id: stegaClean(project._id),
    mediaType: stegaClean(project.mediaType),
    image: cleanImage(project.image),
    video: project.video && {
      asset: project.video.asset && {
        ...project.video.asset,
        playbackId: stegaClean(project.video.asset.playbackId),
        status: stegaClean(project.video.asset.status),
        ratio: stegaClean(project.video.asset.ratio),
      },
    },
    alt: stegaClean(project.alt),
  };
}

function cleanPressLogo(logo: PressLogo): PressLogo {
  return { ...logo, _id: stegaClean(logo._id), logo: cleanImage(logo.logo) };
}

function cleanPartner(partner: Partner): Partner {
  return { ...partner, _id: stegaClean(partner._id), logo: cleanImage(partner.logo) };
}

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
      <WorkGrid projects={featuredProjects.map(cleanProject)} viewAllHref="/work" />
      <PressMarquee pressLogos={pressLogos.map(cleanPressLogo)} />
      <Activations
        heading={siteSettings?.activationsHeading}
        lede={siteSettings?.activationsLede}
        partners={partners.map(cleanPartner)}
      />
    </>
  );
}
