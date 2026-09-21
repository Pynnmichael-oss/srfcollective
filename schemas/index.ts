import type { SchemaTypeDefinition } from 'sanity'

import aboutSettings from './aboutSettings'
import partner from './partner'
import pressLogo from './pressLogo'
import project from './project'
import siteSettings from './siteSettings'

export const schemaTypes: SchemaTypeDefinition[] = [
  siteSettings,
  aboutSettings,
  project,
  pressLogo,
  partner,
]
