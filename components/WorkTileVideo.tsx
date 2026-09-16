'use client'

import MuxPlayer from '@mux/mux-player-react'
import { useEffect, useRef, useState } from 'react'

import styles from './WorkTile.module.css'

interface WorkTileVideoProps {
  playbackId: string
  poster: string
  alt: string
}

// Ambient preview: autoplays and loops unconditionally once it loads —
// no hover gate, no reduced-motion fallback (deliberate override; clips
// are capped at 10s). The IntersectionObserver only defers loading the
// player until the tile nears the viewport, mirroring the image tiles'
// lazy loading — it doesn't gate playback afterward.
export default function WorkTileVideo({ playbackId, poster, alt }: WorkTileVideoProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const node = frameRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={frameRef} className={styles.videoFrame}>
      {shouldLoad ? (
        <MuxPlayer
          streamType="on-demand"
          playbackId={playbackId}
          poster={poster}
          muted
          loop
          autoPlay
          playsInline
          className={styles.videoPlayer}
          style={{ '--controls': 'none' }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt={alt} className={styles.videoPoster} />
      )}
    </div>
  )
}
