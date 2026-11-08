import type { Metadata } from "next";

import WorkGrid from "@/components/WorkGrid";
import { sanityFetch } from "@/lib/sanity/fetch";
import { allTiles } from "@/lib/sanity/media";
import { workProjectsQuery } from "@/lib/sanity/queries";
import { cleanProject } from "@/lib/sanity/stega";
import type { Project } from "@/lib/sanity/types";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Work | SRF Collective",
};

export default async function WorkPage() {
  const projects = await sanityFetch<Project[]>(workProjectsQuery);

  return (
    <main>
      <h1 className={styles.heading}>Work</h1>
      {/* Every photo and video, not just each project's cover, so
          everything she uploads appears here. */}
      <WorkGrid tiles={allTiles(projects.map(cleanProject))} />
    </main>
  );
}
