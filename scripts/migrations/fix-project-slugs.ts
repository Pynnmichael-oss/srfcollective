// One-off fix: every project's slug was hand-typed (descriptive, spaces,
// capitals — e.g. "DayDream Surf Lodge Event") instead of generated through
// the Studio's slug input, which uses speakingurl (the same library
// sanity's defaultSlugify calls — see node_modules/sanity/lib/index.js) to
// produce a lowercase, hyphenated slug from `client`. This sets every
// project's slug to exactly what clicking "Generate" on the client field
// would produce, so the Studio and the stored value agree.
//
// Usage:
//   npx sanity exec scripts/migrations/fix-project-slugs.ts --with-user-token -- --dry-run
//   npx sanity exec scripts/migrations/fix-project-slugs.ts --with-user-token
import getSlug from 'speakingurl'
import { getCliClient } from 'sanity/cli'

const MAX_LENGTH = 96 // schemas/project.ts: slug options.maxLength

function slugify(client: string): string {
  return getSlug(client, { truncate: MAX_LENGTH, symbols: true })
}

async function run() {
  const dryRun = process.argv.includes('--dry-run')
  const client = getCliClient({ apiVersion: '2021-06-07' })

  const projects = await client.fetch<Array<{ _id: string; client: string; slug: string }>>(
    `*[_type == "project" && !(_id in path("drafts.**"))]{
      _id, client, "slug": slug.current
    } | order(client asc)`,
  )

  const newSlugs = new Map<string, string>()
  const report: Array<{ client: string; oldSlug: string; newSlug: string; changed: 'y' | 'n' }> = []

  for (const project of projects) {
    let slug = slugify(project.client)
    // Guard against two clients slugifying to the same value — append the
    // doc id's first 6 chars rather than silently colliding.
    if ([...newSlugs.values()].includes(slug)) {
      slug = `${slug}-${project._id.slice(0, 6)}`
    }
    newSlugs.set(project._id, slug)
    report.push({
      client: project.client,
      oldSlug: project.slug,
      newSlug: slug,
      changed: project.slug === slug ? 'n' : 'y',
    })
  }

  console.log(`Plan: set slugs for ${projects.length} published project(s):\n`)
  console.table(report)

  if (dryRun) {
    console.log('\nDry run only — no writes made. Re-run without --dry-run to apply.')
    return
  }

  const tx = client.transaction()
  for (const project of projects) {
    tx.patch(project._id, (p) => p.set({ slug: { _type: 'slug', current: newSlugs.get(project._id) } }))
  }
  const result = await tx.commit({ visibility: 'sync' })
  console.log(`\nCommitted ${result.results.length} mutation(s). No drafts created.`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
