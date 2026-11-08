import type { Metadata } from "next";

import WorkGrid from "@/components/WorkGrid";
import { sanityFetch } from "@/lib/sanity/fetch";
import { coverTiles } from "@/lib/sanity/media";
import { workProjectsQuery } from "@/lib/sanity/queries";
import { cleanProject } from "@/lib/sanity/stega";
import type { Project } from "@/lib/sanity/types";

import styles from "./page.module.css";

export const revalidate = 60

export const metadata: Metadata = {
  title: "Work | SRF Collective",
};

export default async function WorkPage() {
  const projects = await sanityFetch<Project[]>(workProjectsQuery);

  return (
    <main>
      <h1 className={styles.heading}>Work</h1>
      {/* One cover per project, each linking through to that project's
          own page — which is where the rest of its media lives. */}
      <WorkGrid tiles={coverTiles(projects.map(cleanProject))} behavior="link" />
    </main>
  );
}
