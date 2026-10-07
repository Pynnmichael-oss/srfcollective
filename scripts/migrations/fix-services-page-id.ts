// One-off fix: servicesPage's real content was created at a random document
// id (10cdf565-7f3b-4ec3-aa73-6a0374fae144) instead of the fixed id
// ("servicesPage") that structure.ts's singleton pane always opens, so the
// Studio sidebar showed an empty "Untitled" form instead of the real page.
// This copies that content onto the correct id and removes the orphan.
// The front end is unaffected either way (it queries by _type, and this
// leaves exactly one servicesPage document either before or after).
import { getCliClient } from 'sanity/cli'

const OLD_ID = '10cdf565-7f3b-4ec3-aa73-6a0374fae144'
const NEW_ID = 'servicesPage'

async function run() {
  const client = getCliClient({ apiVersion: '2021-06-07' })

  const old = await client.getDocument(OLD_ID)
  if (!old) {
    console.log(`${OLD_ID} not found — nothing to do.`)
    return
  }

  const fields = { ...old } as Partial<typeof old>
  delete fields._id
  delete fields._rev

  await client.createOrReplace({ ...fields, _id: NEW_ID, _type: old._type })
  console.log(`Created/replaced ${NEW_ID} with ${OLD_ID}'s content.`)

  await client.delete(OLD_ID)
  console.log(`Deleted ${OLD_ID}.`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
