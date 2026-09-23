// Mux stores aspect ratio as a colon-delimited string on the asset's `data`
// object, e.g. "9:16", "16:9", or a non-standard "256:135" for odd source
// footage — never assume a fixed set of ratios. Parsed here into a
// { width, height } pair, usable the same way getImageDimensions() is for
// photos (as CSS aspect-ratio's "W / H" syntax).
export function parseMuxRatio(
  ratio: string | null | undefined,
): { width: number; height: number } | null {
  if (!ratio) return null

  const match = ratio.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/)
  if (!match) return null

  const width = Number(match[1])
  const height = Number(match[2])

  if (!width || !height) return null

  return { width, height }
}
