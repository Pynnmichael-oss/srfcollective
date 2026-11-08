import { useEffect, useState } from 'react'
import { useClient, type DocumentBadgeComponent } from 'sanity'

// Shows "On homepage" at the top of a project she has picked as a homepage
// highlight.
//
// Being featured is stored on siteSettings, not on the project, so without
// this there is nothing on a project to say whether it reaches the homepage
// — she'd have to open Site Settings and read the list. Checking both the
// published and draft siteSettings, because a highlight she has added but
// not yet published still counts as a pending choice worth seeing.
const HomepageBadge: DocumentBadgeComponent = (props) => {
  const client = useClient({ apiVersion: '2024-01-01' })
  const publishedId = props.id.replace(/^drafts\./, '')
  const [featured, setFeatured] = useState(false)

  useEffect(() => {
    let cancelled = false

    client
      .fetch<number>(
        `count(*[_id in ["siteSettings", "drafts.siteSettings"] && references($id)])`,
        { id: publishedId },
      )
      .then((count) => {
        if (!cancelled) setFeatured(count > 0)
      })
      .catch(() => {
        // A failed lookup shouldn't put a wrong badge on the document —
        // better to show nothing than to claim it isn't featured.
        if (!cancelled) setFeatured(false)
      })

    return () => {
      cancelled = true
    }
  }, [client, publishedId])

  if (!featured) return null

  return {
    label: 'On homepage',
    title: 'This project is one of the homepage highlights, set under Homepage.',
    color: 'success',
  }
}

export default HomepageBadge
