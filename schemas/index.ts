import type { SchemaTypeDefinition } from 'sanity'

import partner from './partner'
import pressLogo from './pressLogo'
import project from './project'
import siteSettings from './siteSettings'

export const schemaTypes: SchemaTypeDefinition[] = [siteSettings, project, pressLogo, partner]
