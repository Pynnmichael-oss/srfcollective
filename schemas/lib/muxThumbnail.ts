// Builds a Mux thumbnail URL from data a preview.select has already
// dereferenced (playbackId via `asset->playbackId`) — no async lookup, no
// hook, so it renders synchronously in list rows the first time, unlike the
// old MediaItemThumbnail component this replaces.
export function muxThumbnailUrl(playbackId: string, previewStart?: number): string {
  const time = typeof previewStart === 'number' ? previewStart : 0
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=100&height=100&fit_mode=crop&time=${time}`
}
