import { Card, Grid, Stack, Text } from '@sanity/ui'
import { set, unset, useFormValue, useWorkspace, type StringInputProps } from 'sanity'

interface MediaItemValue {
  _key?: string
  _type?: string
  asset?: { _ref?: string }
  alt?: string
}

// "image-<id>-<width>x<height>-<format>" -> a cdn.sanity.io thumbnail URL.
// Built by hand rather than importing the site's image builder, so the
// Studio bundle doesn't pull in the frontend's Sanity client just to draw
// a few 160px thumbnails.
function thumbnailUrl(ref: string, projectId: string, dataset: string): string | null {
  const match = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/)
  if (!match) return null

  const [, id, dimensions, format] = match
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}?w=200&h=130&fit=crop&auto=format`
}

// Picks which of the project's own photos runs large across the top of its
// page. Stores that item's `_key`, so reordering the media list doesn't
// change the choice (an index would).
//
// Only photos are offered. A portrait video stretched to a viewport-wide
// banner crops to a thin strip and upscales badly — which is the whole
// reason this field exists.
export default function HeroPickerInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props
  const { projectId, dataset } = useWorkspace()
  const media = (useFormValue(['media']) as MediaItemValue[] | undefined) ?? []

  const photos = media.filter(
    (item) => item?._type === 'photoItem' && item?.asset?._ref && item?._key,
  )

  if (!photos.length) {
    return (
      <Card padding={3} tone="transparent" border radius={2}>
        <Text size={1} muted>
          Add a photo under “Photos & videos” above and it will show up here to choose from. With
          no photo, the first item runs at its own natural shape instead of as a wide banner.
        </Text>
      </Card>
    )
  }

  const chosenMissing = Boolean(value) && !photos.some((photo) => photo._key === value)

  const options = [
    { key: null as string | null, ref: null as string | null, caption: 'First item (default)' },
    ...photos.map((photo) => ({
      key: photo._key as string,
      ref: photo.asset?._ref as string,
      caption: photo.alt || 'Photo',
    })),
  ]

  return (
    <Stack space={3}>
      <Grid columns={[2, 3, 4]} gap={2}>
        {options.map((option) => {
          const selected = (option.key ?? null) === (value ?? null)
          const src = option.ref ? thumbnailUrl(option.ref, projectId, dataset) : null

          return (
            <Card
              key={option.key ?? '__default'}
              as="button"
              type="button"
              padding={1}
              radius={2}
              border
              tone={selected ? 'positive' : 'default'}
              disabled={readOnly}
              onClick={() => onChange(option.key ? set(option.key) : unset())}
              style={{ cursor: readOnly ? 'default' : 'pointer', textAlign: 'left' }}
            >
              <Stack space={2}>
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt=""
                    style={{
                      display: 'block',
                      width: '100%',
                      aspectRatio: '20 / 13',
                      objectFit: 'cover',
                      borderRadius: 2,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '20 / 13',
                      borderRadius: 2,
                      background: 'var(--card-muted-bg-color, #f1f3f6)',
                    }}
                  />
                )}
                <Text size={0} muted textOverflow="ellipsis">
                  {selected ? '✓ ' : ''}
                  {option.caption}
                </Text>
              </Stack>
            </Card>
          )
        })}
      </Grid>
      {chosenMissing && (
        <Text size={1} muted>
          The photo that was chosen here has been removed. Pick another, or leave it and the first
          item will be used.
        </Text>
      )}
    </Stack>
  )
}
