import type { Metadata } from "next";
import { stegaClean } from "next-sanity";

import WorkGrid from "@/components/WorkGrid";
import { sanityFetch } from "@/lib/sanity/fetch";
import { workProjectsQuery } from "@/lib/sanity/queries";
import type { Project, SanityImage } from "@/lib/sanity/types";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Work | SRF Collective",
};

// Same targeted stega cleaning as app/(site)/page.tsx: only fields used for
// logic/attributes (_id, mediaType, asset refs) are cleaned; visible text
// (client, category) stays untouched so click-to-edit keeps working.
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

export default async function WorkPage() {
  const projects = await sanityFetch<Project[]>(workProjectsQuery);

  return (
    <main>
      <h1 className={styles.heading}>Work</h1>
      <WorkGrid projects={projects.map(cleanProject)} />
    </main>
  );
}
