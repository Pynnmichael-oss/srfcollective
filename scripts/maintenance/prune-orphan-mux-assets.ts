// Deletes Mux video assets that nothing in the dataset references any more,
// from both Mux and Sanity.
//
// Why this exists: removing a video in Studio deletes the reference, not the
// asset. The `mux.videoAsset` document and the video itself stay in the Mux
// account. That is invisible until it isn't — Mux's free plan allows 10
// stored assets, and uploads start failing with a generic "Something went
// wrong" once you hit it, no matter how few videos the site actually shows.
// That is exactly the failure this project hit in October 2026.
//
// On pay-as-you-go there is no asset cap, so this is now about not paying
// storage on footage nobody can see (and keeping the account legible)
// rather than about unblocking uploads.
//
// Usage (from the repo root):
//   npx sanity exec scripts/maintenance/prune-orphan-mux-assets.ts --with-user-token -- --dry-run
//   npx sanity exec scripts/maintenance/prune-orphan-mux-assets.ts --with-user-token
//
// Dry run first, always: this deletes video from Mux, which cannot be
// undone. The footage would have to be re-uploaded from her own files.
//
// Credentials come from the `secrets.mux` document the Mux plugin wrote
// when it was set up — the same ones Studio uploads with. They are used to
// call Mux and never printed.
import { getCliClient } from 'sanity/cli'

interface MuxSecrets {
  token?: string
  secretKey?: string
}

interface OrphanAsset {
  _id: string
  assetId?: string
  playbackId?: string
  _createdAt: string
}

async function deleteFromMux(
  assetId: string,
  secrets: MuxSecrets,
): Promise<{ ok: boolean; status: number; detail?: string }> {
  const auth = Buffer.from(`${secrets.token}:${secrets.secretKey}`).toString('base64')

  const response = await fetch(`https://api.mux.com/video/v1/assets/${assetId}`, {
    method: 'DELETE',
    headers: { Authorization: `Basic ${auth}` },
  })

  // 404 means Mux has already forgotten it — fine, and the Sanity document
  // should still go.
  if (response.status === 404) {
    return { ok: true, status: 404, detail: 'already gone from Mux' }
  }

  if (!response.ok) {
    return { ok: false, status: response.status, detail: await response.text() }
  }

  return { ok: true, status: response.status }
}

async function run() {
  const dryRun = process.argv.includes('--dry-run')
  const client = getCliClient({ apiVersion: '2024-01-01' })

  // Unreferenced by anything, in any perspective — a draft still editing a
  // video counts as a reference, so a work-in-progress is never pruned.
  const orphans = await client.fetch<OrphanAsset[]>(
    `*[_type == "mux.videoAsset" && count(*[references(^._id)]) == 0]{
      _id, assetId, playbackId, _createdAt
    } | order(_createdAt asc)`,
  )

  console.log(`${orphans.length} orphaned Mux asset(s).`)

  if (!orphans.length) {
    console.log('Nothing to do.')
    return
  }

  if (dryRun) {
    for (const orphan of orphans) {
      console.log(
        `[dry-run] would delete ${orphan._id} (mux asset ${orphan.assetId ?? 'unknown'}, created ${orphan._createdAt})`,
      )
    }
    console.log('Dry run complete; nothing was deleted.')
    return
  }

  const secrets = await client.fetch<MuxSecrets | null>(
    `*[_id == "secrets.mux"][0]{ token, secretKey }`,
  )

  if (!secrets?.token || !secrets?.secretKey) {
    console.error(
      'No Mux credentials found at secrets.mux. Open the video field in Studio and configure the plugin first.',
    )
    process.exit(1)
  }

  for (const orphan of orphans) {
    // No assetId means the upload never completed, so there is nothing on
    // Mux's side to delete — just drop the stub document.
    if (orphan.assetId) {
      const result = await deleteFromMux(orphan.assetId, secrets)

      if (!result.ok) {
        console.error(
          `Mux refused to delete ${orphan.assetId} (HTTP ${result.status}): ${result.detail ?? 'no detail'}`,
        )
        console.error(`Leaving ${orphan._id} in place so it can be retried.`)
        continue
      }

      console.log(
        `deleted mux asset ${orphan.assetId}${result.detail ? ` (${result.detail})` : ''}`,
      )
    } else {
      console.log(`${orphan._id} has no Mux asset id — removing the stub document only`)
    }

    await client.delete(orphan._id)
    console.log(`deleted ${orphan._id}`)
  }

  console.log('Done.')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
