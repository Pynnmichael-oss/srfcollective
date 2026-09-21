import type { Metadata } from "next";

import Services from "@/components/Services";
import { client } from "@/lib/sanity/client";
import { servicesSettingsQuery } from "@/lib/sanity/queries";
import type { ServicesSettings } from "@/lib/sanity/types";

export const metadata: Metadata = {
  title: "Services | SRF Collective",
};

export default async function ServicesPage() {
  // Published content only — same as the client-wide default, stated
  // explicitly here per the project's perspective convention.
  const services = await client.fetch<ServicesSettings | null>(
    servicesSettingsQuery,
    {},
    { perspective: "published" },
  );

  return <Services services={services} />;
}
