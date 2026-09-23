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
// no hover gate (deliberate; clips are capped at ~60s). The
// IntersectionObserver only defers loading the player until the tile nears
// the viewport, mirroring the image tiles' lazy loading — it doesn't gate
// playback afterward. prefers-reduced-motion skips the player entirely,
// since autoplay is the motion being reduced — the poster is shown instead.
export default function WorkTileVideo({ playbackId, poster, alt }: WorkTileVideoProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (reducedMotion) return

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
  }, [reducedMotion])

  return (
    <div ref={frameRef} className={styles.videoFrame}>
      {shouldLoad && !reducedMotion ? (
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
