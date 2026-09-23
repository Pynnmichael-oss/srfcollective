'use client'

import { useIsPresentationTool } from 'next-sanity/hooks'

import styles from './PreviewBanner.module.css'

// Only rendered by the layout when draft mode is already on — this
// component's own job is just the second half of that condition: don't
// show it while the page is loaded inside Presentation's own preview
// iframe, which has its own affordance for exiting preview. The hook
// resolves in three states: null (handshake not yet settled) and false
// both mean "not confirmed inside Presentation", but only false is safe to
// act on — treating null as "not in Presentation" would flash the banner
// on every real Presentation load before the handshake completes.
export default function PreviewBanner() {
  const isPresentationTool = useIsPresentationTool()

  if (isPresentationTool !== false) {
    return null
  }

  return (
    <div className={styles.banner} role="status">
      <span>You&rsquo;re viewing unpublished changes.</span>
      <a href="/api/draft-mode/disable" className={styles.link}>
        Exit preview
      </a>
    </div>
  )
}
