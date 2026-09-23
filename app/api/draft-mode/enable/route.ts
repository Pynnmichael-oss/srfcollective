import { defineEnableDraftMode } from "next-sanity/draft-mode";

import { client } from "@/lib/sanity/client";

// Validates Presentation's own secret before enabling draft mode — hitting
// this URL directly, without that secret, does not enable drafts. Needs a
// token to check the secret document, so a read token is required here,
// not just on the draft-mode fetch itself.
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
});
