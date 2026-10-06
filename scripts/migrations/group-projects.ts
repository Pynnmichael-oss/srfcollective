// Expand/contract migration: copies each published `project`'s old single
// image/video fields into the new `media` array (plus `date` and
// `categories`), without touching the old fields' data at all. The old
// fields stay exactly as they are — the front end keeps reading them until
// a later task switches it over to `media`.
//
// Usage (from the repo root):
//   npx sanity exec scripts/migrations/group-projects.ts --with-user-token -- --dry-run
//   npx sanity exec scripts/migrations/group-projects.ts --with-user-token
//
// --with-user-token is required for the real run (write access); the
// dry-run only reads, but needs it too since the dataset isn't public.
//
// Idempotent: only projects without `media` are touched, so running this
// again later (e.g. right before the front-end switch, to pick up anything
// Rosie added in the meantime) is safe and only migrates what's new.
import { getCliClient } from 'sanity/cli'

type Category = 'Social' | 'Brand' | 'Content' | 'Creative Direction' | 'Events' | 'Weddings'

// Exact mapping given in the task. Anything else is reported and falls
// back to a [Content] placeholder rather than blocking the run.
const CATEGORY_MAP: Record<string, Category[]> = {
  Content: ['Content'],
  'Creative Direction': ['Creative Direction'],
  'Creative Direction & Social': ['Creative Direction', 'Social'],
}

interface OldProject {
  _id: string
  client: string
  _createdAt: string
  category?: string
  mediaType?: 'image' | 'video'
  image?: unknown
  video?: unknown
  previewStart?: number
  alt?: string
}

function randomKey(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

function mapCategories(category: string | undefined, unmapped: string[]): Category[] {
  if (category && CATEGORY_MAP[category]) {
    return CATEGORY_MAP[category]
  }
  unmapped.push(category || '(empty)')
  return ['Content']
}

async function run() {
  const dryRun = process.argv.includes('--dry-run')
  const client = getCliClient({ apiVersion: '2024-01-01' })

  const projects = await client.fetch<OldProject[]>(
    `*[_type == "project" && !(_id in path("drafts.**")) && !defined(media)]{
      _id, client, _createdAt, category, mediaType, image, video, previewStart, alt
    } | order(_createdAt asc)`,
  )

  if (projects.length === 0) {
    console.log('Nothing to do — every published project already has `media`.')
    return
  }

  const unmapped: string[] = []
  const report: Array<{
    client: string
    _id: string
    date: string
    categories: string
    mediaCount: number
    previewStartCarried: 'y' | 'n'
  }> = []

  const tx = client.transaction()

  for (const project of projects) {
    const categories = mapCategories(project.category, unmapped)
    const date = project._createdAt.slice(0, 10)
    const isVideo = project.mediaType === 'video'

    const mediaItem: Record<string, unknown> = {
      _key: randomKey(),
      _type: 'mediaItem',
      mediaType: project.mediaType ?? 'image',
    }
    if (isVideo) {
      if (project.video) mediaItem.video = project.video
      if (typeof project.previewStart === 'number') mediaItem.previewStart = project.previewStart
    } else if (project.image) {
      mediaItem.image = project.image
    }
    if (project.alt) mediaItem.alt = project.alt

    // Only ever adds `date`, `categories`, `media` — never touches the old
    // mediaType/image/video/previewStart/alt/category fields' data.
    tx.patch(project._id, (p) => p.set({ date, categories, media: [mediaItem] }))

    report.push({
      client: project.client,
      _id: project._id,
      date,
      categories: categories.join(', '),
      mediaCount: 1,
      previewStartCarried: isVideo && typeof project.previewStart === 'number' ? 'y' : 'n',
    })
  }

  console.log(`Plan: migrate ${projects.length} published project(s) without a \`media\` field:\n`)
  console.table(report)

  if (unmapped.length > 0) {
    console.log(
      `\nUnmapped category value(s), set to [Content] as a placeholder: ${unmapped.join(', ')}`,
    )
  }

  if (dryRun) {
    console.log('\nDry run only — no writes made. Re-run without --dry-run to apply.')
    return
  }

  // These are published document ids (confirmed by the query filter above
  // and the pre-flight check that found zero drafts) — patching them
  // writes directly to the published content, so there's no separate
  // publish step and nothing left in a draft state.
  const result = await tx.commit({ visibility: 'sync' })
  console.log(`\nCommitted ${result.results.length} mutation(s). No drafts created.`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
