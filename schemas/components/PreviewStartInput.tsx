import MuxPlayer, { type MuxPlayerRefAttributes } from '@mux/mux-player-react'
import { Box, Button, Card, Flex, Stack, Text } from '@sanity/ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import { set, unset, useClient, useFormValue, type NumberInputProps } from 'sanity'

import { clipWindow, PREVIEW_SECONDS } from '../../lib/video'

interface VideoAssetInfo {
  playbackId: string
  duration: number
}

function formatTime(seconds: number) {
  const whole = Math.max(0, Math.round(seconds))
  const m = Math.floor(whole / 60)
  const s = whole % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// The document's `video` field is a reference to a mux.videoAsset document
// — not dereferenced in the form value, so playbackId/duration are fetched
// here directly rather than threaded in as props.
export default function PreviewStartInput(props: NumberInputProps) {
  const { value, onChange, readOnly } = props
  const videoField = useFormValue(['video']) as { asset?: { _ref?: string } } | undefined
  const assetRef = videoField?.asset?._ref
  const client = useClient({ apiVersion: '2024-01-01' })
  const playerRef = useRef<MuxPlayerRefAttributes>(null)
  const [asset, setAsset] = useState<VideoAssetInfo | null>(null)
  const [looping, setLooping] = useState(false)

  useEffect(() => {
    // No assetRef renders the "upload a video first" hint below regardless
    // of any stale `asset` state, so there's nothing to reset here.
    if (!assetRef) return

    let cancelled = false
    client
      .fetch<{ playbackId?: string; duration?: number } | null>(
        `*[_id == $id][0]{ playbackId, "duration": data.duration }`,
        { id: assetRef },
      )
      .then((result) => {
        if (cancelled) return
        setAsset(
          result?.playbackId && typeof result.duration === 'number'
            ? { playbackId: result.playbackId, duration: result.duration }
            : null,
        )
      })
      .catch(() => {
        if (!cancelled) setAsset(null)
      })

    return () => {
      cancelled = true
    }
  }, [assetRef, client])

  const numericValue = typeof value === 'number' ? value : undefined
  const window = asset ? clipWindow(numericValue, asset.duration) : null
  const displayStart = window ? window.start : 0
  const displayEnd = window ? window.end : (asset?.duration ?? 0)

  const handleSetStart = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    onChange(set(Math.round(player.currentTime * 10) / 10))
  }, [onChange])

  const handleReset = useCallback(() => {
    onChange(unset())
  }, [onChange])

  const handlePlayPreview = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    player.currentTime = displayStart
    setLooping(true)
    Promise.resolve(player.play()).catch(() => {})
  }, [displayStart])

  // Loops the chosen window while "Play preview" is active — stops
  // looping (but doesn't pause) if the user scrubs or plays past it.
  useEffect(() => {
    if (!looping) return
    const player = playerRef.current
    if (!player) return

    const onTimeUpdate = () => {
      if (player.currentTime >= displayEnd) {
        player.currentTime = displayStart
      }
    }
    const onPause = () => setLooping(false)

    player.addEventListener('timeupdate', onTimeUpdate)
    player.addEventListener('pause', onPause)
    return () => {
      player.removeEventListener('timeupdate', onTimeUpdate)
      player.removeEventListener('pause', onPause)
    }
  }, [looping, displayStart, displayEnd])

  if (!assetRef) {
    return (
      <Card padding={3} tone="transparent" border radius={2}>
        <Text size={1} muted>
          Upload a video above, then come back here to pick the preview moment.
        </Text>
      </Card>
    )
  }

  if (!asset) {
    return (
      <Card padding={3} tone="transparent" border radius={2}>
        <Text size={1} muted>
          Waiting for the video to finish processing…
        </Text>
      </Card>
    )
  }

  if (asset.duration <= PREVIEW_SECONDS) {
    return (
      <Card padding={3} tone="transparent" border radius={2}>
        <Text size={1} muted>
          This video is under {PREVIEW_SECONDS} seconds, so it plays in full as the grid preview.
        </Text>
      </Card>
    )
  }

  return (
    <Stack space={3}>
      <Box style={{ maxWidth: 320 }}>
        <MuxPlayer
          ref={playerRef}
          streamType="on-demand"
          playbackId={asset.playbackId}
          maxResolution="720p"
          onPause={() => setLooping(false)}
        />
      </Box>
      <Text size={1}>
        Preview: {formatTime(displayStart)} – {formatTime(displayEnd)}
      </Text>
      <Flex gap={2} wrap="wrap">
        <Button text="Start preview here" mode="ghost" onClick={handleSetStart} disabled={readOnly} />
        <Button text="Play preview" mode="ghost" onClick={handlePlayPreview} />
        <Button
          text="Reset to start"
          mode="bleed"
          tone="critical"
          onClick={handleReset}
          disabled={readOnly || numericValue == null}
        />
      </Flex>
    </Stack>
  )
}
