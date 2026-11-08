import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ProjectHero from "@/components/ProjectHero";
import WorkTile from "@/components/WorkTile";
import { client } from "@/lib/sanity/client";
import { sanityFetch } from "@/lib/sanity/fetch";
import { resolveHero, tilesExcept } from "@/lib/sanity/media";
import { projectBySlugQuery, projectSlugsQuery } from "@/lib/sanity/queries";
import { cleanProject } from "@/lib/sanity/stega";
import type { Project } from "@/lib/sanity/types";

import styles from "./page.module.css";

export const revalidate = 60;

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

// "2026-09-16" -> "September 2026". Parsed from the parts rather than passed
// to new Date(), which reads a bare YYYY-MM-DD as UTC midnight and can shift
// it back a day — and so a month — in timezones behind UTC.
function formatProjectDate(value: string | null | undefined): string | null {
  if (!value) return null;

  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return null;

  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1),
  );
}

// Every project page is prerendered at build time. A project added after a
// deploy still renders on demand (dynamicParams defaults to true), so she
// never has to wait for a rebuild to see new work.
//
// Uses `client` rather than sanityFetch: the latter calls draftMode(), which
// Next forbids here because generateStaticParams runs at build time with no
// HTTP request. Published content is the right source for this list anyway —
// a draft has no business creating a prerendered route.
export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(projectSlugsQuery);
  return slugs.map((slug) => ({ slug }));
}

async function getProject(slug: string) {
  return sanityFetch<Project | null>(projectBySlugQuery, { slug });
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return { title: "Project not found | SRF Collective" };
  }

  const description =
    project.description ||
    `${project.client} — ${project.categories?.join(", ") ?? "work"} by SRF Collective.`;

  return {
    title: `${project.client} | SRF Collective`,
    description,
    openGraph: { title: project.client, description },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const raw = await getProject(slug);

  if (!raw) {
    notFound();
  }

  const project = cleanProject(raw);
  const hero = resolveHero(project);

  if (!hero) {
    notFound();
  }

  const tiles = tilesExcept(project, hero.item._key);
  const categories = project.categories?.length ? project.categories.join(", ") : null;
  const date = formatProjectDate(project.date);
  const details = (project.details ?? []).filter((row) => row.label && row.value);

  // The same title block in both places — overlaid on a photo banner, or
  // below a contained video hero. Written once so the two can't drift.
  const title = (
    <>
      <h1 className={styles.client}>{project.client}</h1>
      {(categories || date) && (
        <p className={styles.meta}>
          {categories}
          {categories && date && <span className={styles.separator}> · </span>}
          {date}
        </p>
      )}
    </>
  );

  return (
    <main className={styles.main}>
      <ProjectHero
        item={hero.item}
        mode={hero.mode}
        client={project.client}
        overlay={hero.mode === "banner" ? <div className={styles.overlayTitle}>{title}</div> : null}
      />

      {/* A contained hero carries no overlay, so the title goes here. */}
      {hero.mode === "contained" && <header className={styles.titleBelow}>{title}</header>}

      {(project.description || details.length > 0) && (
        <section className={styles.body}>
          {project.description && <p className={styles.description}>{project.description}</p>}
          {details.length > 0 && (
            <dl className={styles.details}>
              {details.map((row) => (
                <div key={row._key} className={styles.detailRow}>
                  <dt className={styles.detailLabel}>{row.label}</dt>
                  <dd className={styles.detailValue}>{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      )}

      {tiles.length > 0 && (
        <div className={styles.grid}>
          {tiles.map((tile) => (
            // caption off: every tile here is the same client, so repeating
            // the name under each one is noise. behavior defaults to
            // spotlight — videos open full-screen, photos sit still.
            <WorkTile key={tile.key} tile={tile} caption={false} />
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <Link href="/work" className={styles.back}>
          <span aria-hidden="true">←</span> Back to work
        </Link>
      </div>
    </main>
  );
}
