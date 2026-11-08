// Removes leftover `hoverImage` data from `service` documents.
//
// The Services page stopped rendering a per-service image some time ago and
// the schema field went with it, but the data stayed behind. Studio shows a
// "fields not defined in schema" warning on any document holding data for a
// field the schema no longer declares, so this is the difference between a
// clean editing screen and a puzzling warning on one of her services.
//
// Usage (from the repo root):
//   npx sanity exec scripts/maintenance/unset-service-hover-image.ts --with-user-token -- --dry-run
//   npx sanity exec scripts/maintenance/unset-service-hover-image.ts --with-user-token
import { getCliClient } from 'sanity/cli'

async function run() {
  const dryRun = process.argv.includes('--dry-run')
  const client = getCliClient({ apiVersion: '2024-01-01' })

  const services = await client.fetch<{ _id: string; title?: string }[]>(
    `*[_type == "service" && defined(hoverImage)]{ _id, title } | order(_id asc)`,
  )

  console.log(`${services.length} service(s) still holding hoverImage.`)

  if (!services.length) {
    console.log('Nothing to do.')
    return
  }

  for (const service of services) {
    const label = `${service._id} (${service.title ?? 'untitled'})`

    if (dryRun) {
      console.log(`[dry-run] ${label} -> unset hoverImage`)
      continue
    }

    await client.patch(service._id).unset(['hoverImage']).commit()
    console.log(`cleaned ${label}`)
  }

  console.log(dryRun ? 'Dry run complete; nothing was written.' : 'Done.')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
