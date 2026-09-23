'use client'

/**
 * This configuration is used for the Sanity Studio that's mounted on the
 * `/app/studio/[[...tool]]/page.tsx` route.
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { defineLocations, presentationTool } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'
import { muxInput } from 'sanity-plugin-mux-input'

import { schemaTypes } from './schemas'
import { SINGLETON_TYPES, structure } from './structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Schema types live in ./schemas
  schema: { types: schemaTypes },
  plugins: [
    // Custom desk structure lives in ./structure.ts
    structureTool({ structure }),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
    // Upload UI + mux.video schema type for video project entries
    muxInput(),
    // Live preview of drafts inside the Studio, same-origin — no hardcoded
    // domain, so this also works on preview deployments.
    presentationTool({
      previewUrl: {
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
      resolve: {
        locations: {
          project: defineLocations({
            select: { client: 'client' },
            resolve: (doc) => ({
              locations: [{ title: doc?.client || 'Untitled project', href: '/' }],
            }),
          }),
          pressLogo: defineLocations({
            select: { name: 'name' },
            resolve: (doc) => ({
              locations: [{ title: doc?.name || 'Untitled press logo', href: '/' }],
            }),
          }),
          partner: defineLocations({
            select: { name: 'name' },
            resolve: (doc) => ({
              locations: [{ title: doc?.name || 'Untitled partner', href: '/' }],
            }),
          }),
          siteSettings: defineLocations({
            select: {},
            resolve: () => ({ locations: [{ title: 'Homepage', href: '/' }] }),
          }),
          aboutSettings: defineLocations({
            select: {},
            resolve: () => ({ locations: [{ title: 'About', href: '/about' }] }),
          }),
        },
      },
    }),
  ],
  document: {
    // Singletons (Site Settings) can only ever be reached through the fixed
    // link in structure.ts — never offered in the global "+ Create" menu,
    // and never duplicatable or deletable (which would otherwise leave no
    // way back in, since there is intentionally no "create new" affordance).
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        return prev.filter((template) => !SINGLETON_TYPES.has(template.templateId))
      }
      return prev
    },
    actions: (prev, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType)
        ? prev.filter(({ action }) => action !== 'duplicate' && action !== 'delete')
        : prev,
  },
})
