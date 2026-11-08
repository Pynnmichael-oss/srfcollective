import { stegaClean } from 'next-sanity'

import type { MediaItem, Partner, PressLogo, Project, SanityImage } from './types'

// In draft mode, stega tags editable strings with invisible characters.
// That's exactly what makes click-to-edit work for VISIBLE text (client
// name, categories, headline, lede — left untouched here), but the same
// tagging would corrupt a value used for logic or built into a URL or
// attribute rather than displayed as-is. Cleaned once, right after the
// fetch, so WorkTile/PressMarquee/Activations never need to know draft
// mode exists.
//
// Shared by both pages that render projects — the cleaning has to walk the
// media array now, and that's not worth writing twice.

export function cleanImage(image: SanityImage | undefined): SanityImage | undefined {
  if (!image) return image
  return { ...image, asset: stegaClean(image.asset) }
}

function cleanMediaItem(item: MediaItem): MediaItem {
  // _key is cleaned in both branches: it goes into a React key, where
  // invisible characters would mean a changing key on every render.
  if (item._type === 'videoItem') {
    return {
      ...item,
      _key: stegaClean(item._key),
      video:
        item.video && {
          asset:
            item.video.asset && {
              ...item.video.asset,
              playbackId: stegaClean(item.video.asset.playbackId),
              status: stegaClean(item.video.asset.status),
              ratio: stegaClean(item.video.asset.ratio),
            },
        },
      alt: stegaClean(item.alt),
    }
  }

  return {
    ...item,
    _key: stegaClean(item._key),
    asset: item.asset && stegaClean(item.asset),
    alt: stegaClean(item.alt),
  }
}

export function cleanProject(project: Project): Project {
  return {
    ...project,
    _id: stegaClean(project._id),
    coverPhoto: project.coverPhoto && cleanImage(project.coverPhoto),
    media: project.media?.map(cleanMediaItem),
  }
}

export function cleanPressLogo(logo: PressLogo): PressLogo {
  return { ...logo, _id: stegaClean(logo._id), logo: cleanImage(logo.logo) }
}

export function cleanPartner(partner: Partner): Partner {
  return { ...partner, _id: stegaClean(partner._id), logo: cleanImage(partner.logo) }
}
