import { PortableText, type PortableTextComponents } from 'next-sanity'

import { getImageDimensions, urlFor } from '@/lib/sanity/image'
import type { AboutSettings, PortableTextBlock, SanityImage } from '@/lib/sanity/types'

import styles from './About.module.css'

const WIDTHS = [400, 800, 1200]
const SIZES = '(max-width: 900px) 50vw, 33vw'

const bodyComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className={styles.paragraph}>{children}</p>,
  },
  marks: {
    strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
  },
}

// A block with no visible text (e.g. an empty paragraph left in the editor)
// would render as an empty <p> with spacing — drop it instead.
function hasText(block: PortableTextBlock) {
  return Boolean(block.children?.some((child) => child.text?.trim()))
}

function Portrait({ image, alt }: { image: SanityImage; alt: string }) {
  const { width, height } = getImageDimensions(image)

  return (
    <figure className={styles.portrait}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urlFor(image).width(1200).fit('max').auto('format').url()}
        srcSet={WIDTHS.map(
          (w) => `${urlFor(image).width(w).fit('max').auto('format').url()} ${w}w`,
        ).join(', ')}
        sizes={SIZES}
        alt={alt}
        width={width}
        height={height}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className={styles.portraitImg}
      />
    </figure>
  )
}

interface AboutProps {
  about: AboutSettings | null
}

export default function About({ about }: AboutProps) {
  const statement = about?.statement?.trim()
  const founderIntro = about?.founderIntro?.trim()
  const body = (about?.body ?? []).filter(hasText)
  // Missing-portrait guard — the asset isn't delivered yet, so this is the
  // page's real current state: no <img>, no empty box.
  const portrait = about?.portrait?.asset?._ref ? about.portrait : null
  const hasParagraphs = Boolean(founderIntro || body.length)

  if (!statement && !hasParagraphs && !portrait) {
    return null
  }

  return (
    <section className={portrait ? `${styles.about} ${styles.withPortrait}` : styles.about}>
      {portrait && (
        <Portrait image={portrait} alt={about?.portraitAlt || 'Portrait of the founder'} />
      )}
      {(statement || hasParagraphs) && (
        <div className={styles.copy}>
          {statement && <h1 className={styles.statement}>{statement}</h1>}
          {hasParagraphs && (
            <div className={styles.text}>
              {founderIntro && <p className={styles.founderIntro}>{founderIntro}</p>}
              {body.length > 0 && <PortableText value={body} components={bodyComponents} />}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
