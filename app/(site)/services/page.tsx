import type { Metadata } from "next";
import { stegaClean } from "next-sanity";

import Services from "@/components/Services";
import { sanityFetch } from "@/lib/sanity/fetch";
import { servicesSettingsQuery } from "@/lib/sanity/queries";
import type { ServicesSettings } from "@/lib/sanity/types";

export const metadata: Metadata = {
  title: "Services | SRF Collective",
};

export default async function ServicesPage() {
  const services = await sanityFetch<ServicesSettings | null>(servicesSettingsQuery);

  // title/description stay untouched (visible text, click-to-edit); only
  // the array key — used for React reconciliation, not display — is cleaned.
  const cleanedServices = services && {
    ...services,
    services: services.services?.map((item) => ({ ...item, _key: stegaClean(item._key) })),
  };

  return <Services services={cleanedServices} />;
}
