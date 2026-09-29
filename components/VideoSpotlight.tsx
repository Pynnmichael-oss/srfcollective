'use client'

import MuxPlayer, { type MuxPlayerRefAttributes } from '@mux/mux-player-react'
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'

import styles from './VideoSpotlight.module.css'

interface VideoSpotlightProps {
  playbackId: string
  label: string
  // "W / H", the same format WorkTile.tsx already writes to --tile-ratio —
  // passed straight through to a CSS custom property, no parsing needed. If
  // the tile didn't have one, the video's own dimensions are read on
  // loadedmetadata instead (see the effect below).
  aspectRatio?: string
  onClose: () => void
}

// A single video, full length, sound on — opened by clicking a grid tile.
// Native <dialog> + showModal() supplies focus trapping and Esc handling for
// free, and renders in the browser's top layer so it's immune to any
// ancestor's overflow/stacking (the tile it's rendered next to has
// overflow: hidden). Every way of closing (button, Esc, backdrop, browser
// Back) funnels through requestClose so cleanup only happens once.
export default function VideoSpotlight({ playbackId, label, aspectRatio, onClose }: VideoSpotlightProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const playerRef = useRef<MuxPlayerRefAttributes>(null)
  const closingRef = useRef(false)
  const previousOverflowRef = useRef('')
  const reducedMotionRef = useRef(false)
  const [visible, setVisible] = useState(false)
  const [ambientFailed, setAmbientFailed] = useState(false)
  const [measuredRatio, setMeasuredRatio] = useState<string | null>(null)

  // The single path every way of closing funnels through. Cleanup (popping
  // the history entry, notifying the parent) happens here directly rather
  // than in a native 'close' listener — dialog.close() is still called for
  // correct modal/focus-trap semantics, but the app doesn't depend on its
  // event to drive its own state.
  const requestClose = useCallback((fromPopState: boolean) => {
    const dialog = dialogRef.current
    if (!dialog || closingRef.current) return
    closingRef.current = true
    playerRef.current?.pause()

    const finish = () => {
      if (dialog.open) dialog.close()
      if (!fromPopState) {
        history.back()
      }
      onClose()
    }

    if (reducedMotionRef.current) {
      finish()
      return
    }

    setVisible(false)
    const safety = window.setTimeout(finish, 400)
    dialog.addEventListener(
      'transitionend',
      (event) => {
        if (event.propertyName !== 'opacity') return
        window.clearTimeout(safety)
        finish()
      },
      { once: true },
    )
  }, [onClose])

  // Mount: open the dialog, lock scroll, push a history entry so Back closes
  // the spotlight instead of leaving the page, then fade in. Guards
  // (dialog.open / history.state check) keep this idempotent under React
  // StrictMode's dev-only double-invoke.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!dialog.open) dialog.showModal()

    previousOverflowRef.current = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'

    if (!(history.state && history.state.videoSpotlight)) {
      history.pushState({ videoSpotlight: true }, '')
    }

    requestAnimationFrame(() => setVisible(true))

    return () => {
      document.documentElement.style.overflow = previousOverflowRef.current
    }
  }, [])

  // Esc fires a cancelable 'cancel' event natively — intercept it so the
  // dialog animates shut through requestClose instead of disappearing
  // instantly via the browser's own default close.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (event: Event) => {
      event.preventDefault()
      requestClose(false)
    }

    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [requestClose])

  // Browser/phone Back: history already popped, so requestClose(true) skips
  // the history.back() call inside finish() above.
  useEffect(() => {
    const handlePopState = () => requestClose(true)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [requestClose])

  // Playback starts on mount, which runs inside the same user-gesture task
  // as the tile click. mux-player attaches its actual HLS source slightly
  // after this ref is available, so the first play() call sometimes races
  // that and gets an AbortError ("interrupted by a new load request") —
  // not a policy rejection, so it's retried once rather than treated as
  // blocked. A genuine rejection (e.g. NotAllowedError) falls back to
  // muted with controls visible rather than a stuck player. No `autoPlay`
  // attribute on <MuxPlayer> — it drives its own internal play() attempt
  // independently of (and racing) this one, and that internal attempt has
  // no muted fallback, so relying on both was the source of the original
  // muted-start bug.
  useEffect(() => {
    const player = playerRef.current
    if (!player) return
    let cancelled = false

    const attemptPlay = async (retryAborted: boolean): Promise<void> => {
      try {
        await player.play()
      } catch (err) {
        if (cancelled) return
        if (retryAborted && err instanceof DOMException && err.name === 'AbortError') {
          return attemptPlay(false)
        }
        player.muted = true
        try {
          await player.play()
        } catch {
          // Autoplay blocked even muted — controls remain for the user.
        }
      }
    }

    attemptPlay(true)

    return () => {
      cancelled = true
    }
  }, [])

  // Aspect ratio: the tile's own ratio, passed straight through to CSS
  // (see .content's aspect-ratio/width in VideoSpotlight.module.css) — or,
  // if the tile didn't have one, the video's real dimensions once known.
  useEffect(() => {
    if (aspectRatio) return
    const player = playerRef.current
    if (!player) return

    const handleLoadedMetadata = () => {
      if (player.videoWidth && player.videoHeight) {
        setMeasuredRatio(`${player.videoWidth} / ${player.videoHeight}`)
      }
    }
    player.addEventListener('loadedmetadata', handleLoadedMetadata)
    return () => player.removeEventListener('loadedmetadata', handleLoadedMetadata)
  }, [aspectRatio])

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      requestClose(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${visible ? styles.visible : ''}`}
      aria-label={`${label} spotlight`}
      onClick={handleBackdropClick}
    >
      {/* Fills the empty sides a vertical video leaves on a wide screen.
          Sits behind everything else in DOM order — no z-index needed to
          stay under the close button and player. A failed thumbnail load
          just leaves the plain --black + --overlay backdrop, never a
          broken-image icon. */}
      <div className={styles.ambient} aria-hidden="true">
        {!ambientFailed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://image.mux.com/${playbackId}/thumbnail.webp?width=640`}
            alt=""
            className={styles.ambientImage}
            onError={() => setAmbientFailed(true)}
          />
        )}
      </div>
      <button
        type="button"
        className={styles.close}
        aria-label="Close"
        onClick={() => requestClose(false)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="4" x2="20" y2="20" />
          <line x1="20" y1="4" x2="4" y2="20" />
        </svg>
      </button>
      <div
        className={`${styles.content} ${visible ? styles.visible : ''}`}
        style={{ '--content-ratio': aspectRatio || measuredRatio || undefined } as CSSProperties}
      >
        <MuxPlayer
          ref={playerRef}
          streamType="on-demand"
          playbackId={playbackId}
          playsInline
          className={styles.player}
        />
      </div>
    </dialog>
  )
}
