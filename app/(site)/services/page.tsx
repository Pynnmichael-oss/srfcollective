import type { Metadata } from "next";
import { stegaClean } from "next-sanity";

import Services from "@/components/Services";
<<<<<<< HEAD
import { sanityFetch } from "@/lib/sanity/fetch";
import { servicesSettingsQuery } from "@/lib/sanity/queries";
import type { ServicesSettings } from "@/lib/sanity/types";
=======
import { client } from "@/lib/sanity/client";
import { servicesPageQuery } from "@/lib/sanity/queries";
import type { ServicesPageData } from "@/lib/sanity/types";
>>>>>>> origin/site-work

export const metadata: Metadata = {
  title: "Services | SRF Collective",
};

export default async function ServicesPage() {
<<<<<<< HEAD
  const services = await sanityFetch<ServicesSettings | null>(servicesSettingsQuery);

  // title/description stay untouched (visible text, click-to-edit); only
  // the array key — used for React reconciliation, not display — is cleaned.
  const cleanedServices = services && {
    ...services,
    services: services.services?.map((item) => ({ ...item, _key: stegaClean(item._key) })),
  };

  return <Services services={cleanedServices} />;
=======
  // Published content only — same as the client-wide default, stated
  // explicitly here per the project's perspective convention.
  const { page, services } = await client.fetch<ServicesPageData>(
    servicesPageQuery,
    {},
    { perspective: "published" },
  );

  return <Services page={page} services={services} />;
>>>>>>> origin/site-work
}
