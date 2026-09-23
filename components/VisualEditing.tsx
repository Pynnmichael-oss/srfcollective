'use client'

import { useRouter } from 'next/navigation'
import { VisualEditing as SanityVisualEditing } from 'next-sanity/visual-editing'

// next-sanity's own <VisualEditing> deliberately does NOT refresh the page
// when Studio reports a "mutation" (an edit was saved) — only on its own
// "manual" refresh action. Without a custom handler it just logs a debug
// message and no-ops, so editing a field in Presentation never updates the
// live preview on its own. This wraps it with a handler that refreshes on
// both, so edits show up without a manual reload.
export default function VisualEditing() {
  const router = useRouter()

  return (
    <SanityVisualEditing
      refresh={(payload) => {
        if (payload.source !== 'manual' && payload.source !== 'mutation') {
          return false
        }
        router.refresh()
        return new Promise((resolve) => setTimeout(resolve, 1000))
      }}
    />
  )
}
