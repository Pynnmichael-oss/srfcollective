import type { Metadata } from "next";
import { stegaClean } from "next-sanity";

import Services from "@/components/Services";
import { sanityFetch } from "@/lib/sanity/fetch";
import { servicesPageQuery } from "@/lib/sanity/queries";
import type { ServicesPageData } from "@/lib/sanity/types";

export const metadata: Metadata = {
  title: "Services | SRF Collective",
};

export default async function ServicesPage() {
  const { page, services } = await sanityFetch<ServicesPageData>(servicesPageQuery);

  // _id is used as a React key, not shown as text; title/subtitle/description
  // stay untouched — they're visible text, and click-to-edit needs stega's
  // tagging intact on them.
  const cleanedServices = services.map((service) => ({
    ...service,
    _id: stegaClean(service._id),
  }));

  return <Services page={page} services={cleanedServices} />;
}
