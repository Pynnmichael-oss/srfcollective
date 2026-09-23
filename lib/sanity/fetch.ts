import 'server-only'

import { draftMode } from 'next/headers'
import type { QueryParams } from 'next-sanity'

import { client } from './client'

// apiVersion (see client.ts) predates the 2025-02-19 API cutover that
// renamed the "previewDrafts" perspective to "drafts" — the older name is
// what this dated API version actually recognizes. Functionally identical
// to "drafts" at the client level; using it here only prints a one-line
// deprecation notice in the server log, never in the browser console.
const DRAFT_PERSPECTIVE = 'previewDrafts' as const

/**
 * The one fetch used by every Sanity-backed route. Draft mode off (the
 * live site) is exactly today's `client.fetch(query, params)` — same
 * perspective ('published', from client.ts), same useCdn, no token, no
 * stega, so output is byte-for-byte unchanged. Draft mode on (Presentation)
 * reads drafts with a token, bypasses the CDN, disables caching, and
 * enables stega so Visual Editing can find and outline editable fields.
 */
export async function sanityFetch<T>(query: string, params: QueryParams = {}): Promise<T> {
  const { isEnabled: isDraftMode } = await draftMode()

  if (!isDraftMode) {
    return client.fetch<T>(query, params)
  }

  return client.fetch<T>(query, params, {
    perspective: DRAFT_PERSPECTIVE,
    useCdn: false,
    token: process.env.SANITY_API_READ_TOKEN,
    stega: {
      enabled: true,
      studioUrl: '/studio',
    },
    cache: 'no-store',
  })
}
