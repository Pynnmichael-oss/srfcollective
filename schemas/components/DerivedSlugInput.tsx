import { Card, Stack, Text } from '@sanity/ui'
import { useEffect } from 'react'
import { set, useFormValue, type SlugInputProps } from 'sanity'

// Turns "Society Cafe  x Curated Saga" into "society-cafe-x-curated-saga".
export function slugifyClient(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
    .replace(/-+$/, '')
}

// The project's web address, shown but never typed.
//
// Replaces Sanity's default slug input, whose "Generate" button is both
// developer vocabulary and an easy thing to forget — a project published
// without one has no URL, so its page 404s. This fills itself in from the
// client name instead.
//
// Deliberately one-way: once an address exists it is never recomputed, so
// renaming a client later (fixing a typo, say) can't silently change a URL
// that has already been shared or indexed.
export default function DerivedSlugInput(props: SlugInputProps) {
  const { value, onChange, readOnly } = props
  const client = useFormValue(['client']) as string | undefined
  const current = value?.current

  useEffect(() => {
    if (readOnly || current) return

    const next = client ? slugifyClient(client) : ''
    if (!next) return

    onChange(set({ _type: 'slug', current: next }))
  }, [client, current, onChange, readOnly])

  return (
    <Card padding={3} tone="transparent" border radius={2}>
      <Stack space={3}>
        <Text size={1} weight="medium">
          {current ? `/work/${current}` : 'Fill in the client name above and this fills itself in.'}
        </Text>
        <Text size={1} muted>
          This is the web address of the project’s own page. It is set from the client name and
          stays put if you rename the client later, so links you have already shared keep working.
        </Text>
      </Stack>
    </Card>
  )
}
