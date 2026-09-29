'use client'

import MuxPlayer, { type MuxPlayerRefAttributes } from '@mux/mux-player-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import sharedStyles from './WorkTile.module.css'
import styles from './WorkTileVideo.module.css'
import VideoSpotlight from './VideoSpotlight'

interface WorkTileVideoProps {
  playbackId: string
  poster: string
  alt: string
}

// One event, shared by every grid tile's module instance, so opening any
// tile's spotlight pauses every other tile without a context provider — see
// step 4 of the video-spotlight task. Closing broadcasts false and each
// tile's own visibility/tab gates (below) decide whether it resumes.
const SPOTLIGHT_EVENT = 'srfcollective:video-spotlight'

function broadcastSpotlight(open: boolean) {
  window.dispatchEvent(new CustomEvent<boolean>(SPOTLIGHT_EVENT, { detail: open }))
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
// A fourth gate, spotlightOpenRef below, pauses every tile while any tile's
// spotlight is open.
// prefers-reduced-motion skips the player entirely (poster only) — existing
// behavior, unchanged.
export default function WorkTileVideo({ playbackId, poster, alt }: WorkTileVideoProps) {
  const frameRef = useRef<HTMLButtonElement>(null)
  const playerRef = useRef<MuxPlayerRefAttributes>(null)
  const inViewRef = useRef(false)
  const spotlightOpenRef = useRef(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  // Single place that decides play vs pause from the facts that matter: is
  // the tile on screen, is the tab visible, and is any spotlight open.
  // play() rejections (autoplay blocked, interrupted by a pause) are
  // expected and ignored.
  const syncPlayback = useCallback(() => {
    const player = playerRef.current
    if (!player) return

    if (!spotlightOpenRef.current && inViewRef.current && document.visibilityState === 'visible') {
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

  // Gate 4: every tile (not just the one that opened it) pauses while any
  // spotlight is open, and re-checks its own visibility once it closes.
  useEffect(() => {
    const onSpotlightEvent = (event: Event) => {
      spotlightOpenRef.current = Boolean((event as CustomEvent<boolean>).detail)
      syncPlayback()
    }
    window.addEventListener(SPOTLIGHT_EVENT, onSpotlightEvent)
    return () => window.removeEventListener(SPOTLIGHT_EVENT, onSpotlightEvent)
  }, [syncPlayback])

  const openSpotlight = useCallback(() => {
    broadcastSpotlight(true)
    setIsSpotlightOpen(true)
  }, [])

  const closeSpotlight = useCallback(() => {
    setIsSpotlightOpen(false)
    broadcastSpotlight(false)
    frameRef.current?.focus()
  }, [])

  // alt already carries the best available name — the project's client name
  // in the common case, or a custom description when one's set (see
  // WorkTile.tsx) — so the trigger's label is built from it directly rather
  // than a separate prop. Guards against "Watch Project video video with
  // sound" if alt ever falls all the way back to that literal string.
  const triggerLabel = alt.toLowerCase().includes('video')
    ? `Watch ${alt} with sound`
    : `Watch ${alt} video with sound`

  return (
    <>
      <button
        ref={frameRef}
        type="button"
        className={`${sharedStyles.videoFrame} ${styles.trigger}`}
        aria-label={triggerLabel}
        onClick={openSpotlight}
      >
        {shouldLoad && !reducedMotion ? (
          <MuxPlayer
            ref={playerRef}
            streamType="on-demand"
            playbackId={playbackId}
            poster={poster}
            maxResolution="720p"
            muted
            loop
            playsInline
            onCanPlay={syncPlayback}
            className={sharedStyles.videoPlayer}
            style={{ '--controls': 'none' }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt={alt} className={sharedStyles.videoPoster} />
        )}
        <span className={styles.muteBadge} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        </span>
      </button>
      {isSpotlightOpen && (
        <VideoSpotlight playbackId={playbackId} label={alt} onClose={closeSpotlight} />
      )}
    </>
  )
}
