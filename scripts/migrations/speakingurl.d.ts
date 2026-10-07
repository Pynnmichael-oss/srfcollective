// speakingurl ships its own .d.ts (node_modules/speakingurl/typings) but
// doesn't point package.json "types" at it, so TS can't resolve it. This is
// the same library sanity's own defaultSlugify calls under the hood — see
// fix-project-slugs.ts.
declare module 'speakingurl' {
  interface SpeakingUrlOptions {
    truncate?: number
    symbols?: boolean
    [key: string]: unknown
  }
  export default function getSlug(input: string, options?: SpeakingUrlOptions): string
}
