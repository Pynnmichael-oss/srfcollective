// Shared by the Studio preview-start picker and the grid tile, so they
// always agree on what "the 10-second preview" actually means.
export const PREVIEW_SECONDS = 10

export interface ClipWindow {
  start: number
  end: number
}

/**
 * The grid preview's clip window, in seconds. Returns null when the video
 * is too short to need clipping at all (loop the whole thing instead) —
 * otherwise the PREVIEW_SECONDS window starting at previewStart, clamped
 * so it never runs past the video's end.
 */
export function clipWindow(
  previewStart: number | null | undefined,
  duration: number,
): ClipWindow | null {
  if (duration <= PREVIEW_SECONDS) {
    return null
  }

  const maxStart = duration - PREVIEW_SECONDS
  const start = Math.min(previewStart ?? 0, maxStart)

  return { start, end: start + PREVIEW_SECONDS }
}
