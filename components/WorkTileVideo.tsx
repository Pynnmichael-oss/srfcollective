'use client'

import MuxPlayer, { type MuxPlayerRefAttributes } from '@mux/mux-player-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import styles from './WorkTile.module.css'

interface WorkTileVideoProps {
  playbackId: string
  poster: string
  alt: string
}

// Ambient preview, billed per minute delivered — so it only streams while it
// can be seen. Three gates, all per tile:
//   1. Load: the player (and its Mux source) isn't mounted until the tile is
//      within about one viewport of the screen; before that only the poster
//      renders. Once loaded it stays mounted (no detach/re-attach on scroll).
//   2. Visibility: play() when >=25% of the tile is on screen, pause() when
//      it drops below. The native autoplay attribute is deliberately not used
//      — the observer drives playback.
//   3. Tab: paused while the document is hidden; on return, only tiles
//      currently in the viewport resume.
// prefers-reduced-motion skips the player entirely (poster only) — existing
// behavior, unchanged.
export default function WorkTileVideo({ playbackId, poster, alt }: WorkTileVideoProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<MuxPlayerRefAttributes>(null)
  const inViewRef = useRef(false)
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

  // Single place that decides play vs pause from the two facts that matter:
  // is the tile on screen, and is the tab visible. play() rejections
  // (autoplay blocked, interrupted by a pause) are expected and ignored.
  const syncPlayback = useCallback(() => {
    const player = playerRef.current
    if (!player) return

    if (inViewRef.current && document.visibilityState === 'visible') {
      Promise.resolve(player.play()).catch(() => {})
    } else {
      player.pause()
    }
  }, [])

  // Gate 1: mount the player once the tile is within ~one viewport.
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
      { rootMargin: '100% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [reducedMotion])

  // Gates 2 and 3: visibility and tab state. Runs for the tile's whole
  // lifetime; syncPlayback is a no-op until the player has mounted.
  useEffect(() => {
    if (reducedMotion) return

    const node = frameRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting
        syncPlayback()
      },
      { threshold: 0.25 },
    )
    observer.observe(node)
    document.addEventListener('visibilitychange', syncPlayback)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', syncPlayback)
    }
  }, [reducedMotion, syncPlayback])

  return (
    <div ref={frameRef} className={styles.videoFrame}>
      {shouldLoad && !reducedMotion ? (
        <MuxPlayer
          ref={playerRef}
          streamType="on-demand"
          playbackId={playbackId}
          poster={poster}
          muted
          loop
          playsInline
          onCanPlay={syncPlayback}
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
