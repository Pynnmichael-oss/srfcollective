// Removes the legacy single-media fields from `project` documents, now that
// the front end reads the `media` array instead (lib/sanity/queries.ts) and
// the fields are gone from schemas/project.ts.
//
// Fields unset: mediaType, image, video, previewStart, category, alt,
// aspectRatioHint.
//
// RUN THIS LAST — and only once the deployed site has been checked. Until
// the new front end is live, these fields are what the site renders from;
// unsetting them early takes every tile off the homepage and /work. They
// are also the pre-migration backup: their contents were copied into
// `media` by group-projects.ts, so this is the step that stops there being
// a second copy.
//
// Why bother at all: Studio shows a "fields not defined in schema" warning
// on any document holding data for a field the schema no longer declares.
// Leaving the data in place means that warning on every project she opens.
//
// Usage (from the repo root):
//   npx sanity exec scripts/migrations/drop-legacy-project-fields.ts --with-user-token -- --dry-run
//   npx sanity exec scripts/migrations/drop-legacy-project-fields.ts --with-user-token
//
// Idempotent: unsetting an absent field is a no-op, and documents with none
// of the fields left are skipped.
import { getCliClient } from 'sanity/cli'

const LEGACY_FIELDS = [
  'mediaType',
  'image',
  'video',
  'previewStart',
  'category',
  'alt',
  'aspectRatioHint',
] as const

interface ProjectDoc {
  _id: string
  client?: string
  // One boolean per legacy field, keyed by field name — a plain projection
  // rather than a conditional array, which this API version won't parse.
  has?: Record<string, boolean>
}

async function run() {
  const dryRun = process.argv.includes('--dry-run')
  const client = getCliClient({ apiVersion: '2024-01-01' })

  // Guard: every project must have renderable `media` before its legacy
  // fields go, or this script is what empties the site.
  const unmigrated = await client.fetch<{ _id: string; client?: string }[]>(
    `*[_type == "project" && (
        !defined(media) ||
        count(media[
          (_type == "photoItem" && defined(asset._ref)) ||
          (_type == "videoItem" && defined(video.asset))
        ]) == 0
      )]{ _id, client }`,
  )

  if (unmigrated.length) {
    console.error(
      `Refusing to run: ${unmigrated.length} project(s) have no renderable media in the new shape.`,
    )
    for (const project of unmigrated) {
      console.error(`  - ${project._id} (${project.client ?? 'no client'})`)
    }
    console.error('Run split-media-types.ts first, or fix these documents in Studio.')
    process.exit(1)
  }

  const projects = await client.fetch<ProjectDoc[]>(
    `*[_type == "project"]{
      _id,
      client,
      "has": { ${LEGACY_FIELDS.map((field) => `"${field}": defined(${field})`).join(', ')} }
    } | order(_id asc)`,
  )

  const present = (project: ProjectDoc) =>
    LEGACY_FIELDS.filter((field) => project.has?.[field])

  const needsWork = projects.filter((project) => present(project).length > 0)

  console.log(`${projects.length} project(s); ${needsWork.length} still holding legacy fields.`)

  if (!needsWork.length) {
    console.log('Nothing to do.')
    return
  }

  for (const project of needsWork) {
    const fields = present(project)
    const label = `${project._id} (${project.client ?? 'no client'})`

    if (dryRun) {
      console.log(`[dry-run] ${label} -> unset ${fields.join(', ')}`)
      continue
    }

    await client.patch(project._id).unset([...fields]).commit()
    console.log(`cleaned ${label} — unset ${fields.join(', ')}`)
  }

  console.log(dryRun ? 'Dry run complete; nothing was written.' : 'Done.')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
