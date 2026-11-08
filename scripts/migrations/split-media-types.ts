// Converts each project's `media` array from the old single `mediaItem`
// object type to the two member types that replaced it — `photoItem` (an
// image array member) and `videoItem` — see schemas/objects/.
//
// Shape change, per item:
//   { _type: 'mediaItem', mediaType: 'image', image: {asset, hotspot}, alt }
//     -> { _type: 'photoItem', asset, hotspot, alt }
//   { _type: 'mediaItem', mediaType: 'video', video, previewStart, alt }
//     -> { _type: 'videoItem', video, previewStart, alt }
//
// `_key` is preserved so Studio's ordering and any open editor sessions
// survive the rewrite.
//
// This MUST run before the front end that reads the new shape is deployed:
// lib/sanity/queries.ts filters on `_type`, so unmigrated items match
// nothing and the grids come back empty.
//
// Usage (from the repo root):
//   npx sanity exec scripts/migrations/split-media-types.ts --with-user-token -- --dry-run
//   npx sanity exec scripts/migrations/split-media-types.ts --with-user-token
//
// Idempotent: items already carrying the new `_type` are left alone, so a
// re-run only picks up what's new. Drafts are included — an unpublished
// project she's mid-way through editing needs migrating too.
import { getCliClient } from 'sanity/cli'

interface OldMediaItem {
  _key: string
  _type: string
  mediaType?: 'image' | 'video'
  image?: { asset?: unknown; hotspot?: unknown }
  video?: unknown
  previewStart?: number
  alt?: string
}

interface ProjectDoc {
  _id: string
  client?: string
  media?: OldMediaItem[]
}

function convert(item: OldMediaItem): Record<string, unknown> {
  if (item._type !== 'mediaItem') {
    return item as unknown as Record<string, unknown>
  }

  if (item.mediaType === 'video') {
    return {
      _key: item._key,
      _type: 'videoItem',
      ...(item.video ? { video: item.video } : {}),
      ...(typeof item.previewStart === 'number' ? { previewStart: item.previewStart } : {}),
      ...(item.alt ? { alt: item.alt } : {}),
    }
  }

  // Photo: the old object nested the image under `image`; a photoItem IS
  // the image, so asset/hotspot move up onto the item itself.
  return {
    _key: item._key,
    _type: 'photoItem',
    ...(item.image?.asset ? { asset: item.image.asset } : {}),
    ...(item.image?.hotspot ? { hotspot: item.image.hotspot } : {}),
    ...(item.alt ? { alt: item.alt } : {}),
  }
}

async function run() {
  const dryRun = process.argv.includes('--dry-run')
  const client = getCliClient({ apiVersion: '2024-01-01' })

  const projects = await client.fetch<ProjectDoc[]>(
    `*[_type == "project" && defined(media)]{ _id, client, media } | order(_id asc)`,
  )

  const needsWork = projects.filter((project) =>
    (project.media ?? []).some((item) => item._type === 'mediaItem'),
  )

  console.log(
    `${projects.length} project(s) with media; ${needsWork.length} still on the old shape.`,
  )

  if (!needsWork.length) {
    console.log('Nothing to do.')
    return
  }

  for (const project of needsWork) {
    const migrated = (project.media ?? []).map(convert)
    const label = `${project._id} (${project.client ?? 'no client'})`

    if (dryRun) {
      console.log(`[dry-run] ${label}`)
      for (const item of migrated) {
        console.log(`           -> ${String(item._type)} (_key ${String(item._key)})`)
      }
      continue
    }

    await client.patch(project._id).set({ media: migrated }).commit()
    console.log(`migrated ${label} — ${migrated.length} item(s)`)
  }

  console.log(dryRun ? 'Dry run complete; nothing was written.' : 'Done.')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
