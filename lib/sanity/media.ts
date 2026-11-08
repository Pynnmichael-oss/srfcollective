import type { MediaItem, MediaTile, Project } from './types'

// Projects hold many photos and videos; the grids render one cell per
// photo or video. These two functions are the only place that decides how
// a project becomes grid cells, so the homepage and /work can differ
// without either page knowing how the other works.

function toTile(project: Project, item: MediaItem): MediaTile {
  const slug = project.slug?.current
  return {
    projectHref: slug ? `/work/${slug}` : undefined,
    // _key is unique within a project, _id across projects — together they
    // give a stable React key that survives reordering in Studio.
    key: `${project._id}:${item._key}`,
    client: project.client,
    categories: project.categories,
    item,
  }
}

/**
 * One cell per project: its cover, which is whatever she dragged to the top
 * of the media list. Used by both grids — the homepage, where "up to 9
 * highlights" has to stay 9 cells no matter how many photos each project
 * holds, and /work, where each cover links through to the project's page.
 */
export function coverTiles(projects: Project[]): MediaTile[] {
  return projects.flatMap((project) => {
    const cover = project.media?.[0]
    return cover ? [toTile(project, cover)] : []
  })
}

/**
 * Every photo and video of the given projects, in project order and then in
 * her media order. Used by a project's own page, passed that one project.
 */
export function allTiles(projects: Project[]): MediaTile[] {
  return projects.flatMap((project) => (project.media ?? []).map((item) => toTile(project, item)))
}

export interface ResolvedHero {
  item: MediaItem
  // 'banner'    -> a photo, full-bleed across the viewport with the project
  //                name overlaid on it.
  // 'contained' -> a video, at its own natural shape and height-capped.
  //                Never full-bleed: cropping a 9:16 portrait into a wide
  //                banner discards most of the frame and upscales the rest.
  mode: 'banner' | 'contained'
}

/**
 * Which media item heads a project page, and how it's shown.
 *
 * Her pick (heroPhotoKey) wins; if it's missing or points at something that
 * has since been deleted, the first item is used. Only a photo earns the
 * full-bleed banner — see ResolvedHero.
 */
export function resolveHero(project: Project): ResolvedHero | null {
  const media = project.media ?? []
  if (!media.length) return null

  const chosen = project.heroPhotoKey
    ? media.find((item) => item._key === project.heroPhotoKey && item._type === 'photoItem')
    : undefined

  const item = chosen ?? media[0]

  return { item, mode: item._type === 'photoItem' ? 'banner' : 'contained' }
}

/**
 * Every tile except the one heading the page, so the hero isn't also
 * repeated in the grid below it.
 */
export function tilesExcept(project: Project, heroKey: string | undefined): MediaTile[] {
  return allTiles([project]).filter((tile) => tile.item._key !== heroKey)
}
