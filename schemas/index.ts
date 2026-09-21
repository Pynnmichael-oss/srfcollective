import type { SchemaTypeDefinition } from 'sanity'

import aboutSettings from './aboutSettings'
import partner from './partner'
import pressLogo from './pressLogo'
import project from './project'
import servicesSettings from './servicesSettings'
import siteSettings from './siteSettings'

export const schemaTypes: SchemaTypeDefinition[] = [
  siteSettings,
  aboutSettings,
  servicesSettings,
  project,
  pressLogo,
  partner,
]
