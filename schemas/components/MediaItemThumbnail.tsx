import { useEffect, useState } from 'react'
import { useClient } from 'sanity'

import { clipWindow } from '../../lib/video'

interface MediaItemThumbnailProps {
  mediaType?: 'image' | 'video'
  imageAssetRef?: string
  videoAssetRef?: string
  previewStart?: number
}

// Array-list preview thumbnail for a media item. Images render directly via
// Sanity's own asset CDN URL (no need to dereference anything); videos need
// an extra fetch to resolve the Mux playbackId + duration before a thumbnail
// URL can be built — same lookup PreviewStartInput already does for the same
// reason (the `video` field only holds an asset _ref in the form value).
export default function MediaItemThumbnail({
  mediaType,
  imageAssetRef,
  videoAssetRef,
  previewStart,
}: MediaItemThumbnailProps) {
  const client = useClient({ apiVersion: '2024-01-01' })
  const [video, setVideo] = useState<{ playbackId?: string; duration?: number } | null>(null)

  useEffect(() => {
    if (!videoAssetRef) return

    let cancelled = false
    client
      .fetch<{ playbackId?: string; duration?: number } | null>(
        `*[_id == $id][0]{ playbackId, "duration": data.duration }`,
        { id: videoAssetRef },
      )
      .then((result) => {
        if (!cancelled) setVideo(result ?? null)
      })
      .catch(() => {
        if (!cancelled) setVideo(null)
      })

    return () => {
      cancelled = true
    }
  }, [videoAssetRef, client])

  // Ignore stale fetched state once the asset ref it was fetched for is
  // gone (e.g. this item switched from video to image) — no extra setState.
  const activeVideo = videoAssetRef ? video : null

  if (mediaType === 'image' && imageAssetRef) {
    // Sanity image asset _ref: "image-<id>-<width>x<height>-<format>".
    const [, id, dims, format] = imageAssetRef.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/) || []
    if (id && dims && format) {
      const { projectId, dataset } = client.config()
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dims}.${format}?w=100&h=100&fit=crop`}
          alt=""
        />
      )
    }
  }

  if (mediaType === 'video' && activeVideo?.playbackId && typeof activeVideo.duration === 'number') {
    const clip = clipWindow(previewStart, activeVideo.duration)
    const time = clip ? clip.start : 0
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://image.mux.com/${activeVideo.playbackId}/thumbnail.jpg?width=100&height=100&fit_mode=crop&time=${time}`}
        alt=""
      />
    )
  }

  return null
}
