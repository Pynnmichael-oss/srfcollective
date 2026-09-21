/**
 * Studio's own root layout — deliberately independent from
 * app/(site)/layout.tsx (a separate Next.js root layout via route groups,
 * see https://nextjs.org/docs/app/api-reference/file-conventions/layout#root-layout).
 *
 * Sanity's <NextStudio> renders its own root container at a fixed
 * `height: 100vh` with its own internal scrolling, expecting to be the only
 * content in <body>. Nesting it under the marketing site's root layout put
 * <Nav> and <Footer> in <body> alongside it and pulled in globals.css's
 * unscoped `* { box-sizing: border-box }` / body font-family rules — the
 * combination broke Studio's height math and internal scroll (the document
 * editor's Publish button became unreachable without scrolling the outer
 * page).
 *
 * Studio's own injected GlobalStyle is NOT a full reset, though — see the
 * <style> tag below for the box-model gap it leaves and why this route
 * still needs one small scoped rule of its own.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
         * Sanity's own injected GlobalStyle (next-sanity's <NextStudio>
         * passes unstable_globalStyles to <Studio>) sets html{background},
         * body{scrollbar-gutter}, and #sanity{font-family} — but never
         * margin/height. It assumes the host app resets those. Without it,
         * the default UA `body { margin: 8px }` makes the outer document
         * ~16px taller than the viewport, so <NextStudio>'s `#sanity`
         * (height: 100vh, normal document flow, not position: fixed)
         * drifts out of alignment with the real viewport the moment the
         * outer page scrolls even slightly — pinning its bottom action bar
         * (Publish) out of view. Scoped here, not in globals.css/tokens.css,
         * so it touches only this route.
         */}
        <style>{'html, body { margin: 0; height: 100%; }'}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
