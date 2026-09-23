import type { Metadata } from "next";

import Services from "@/components/Services";
import { client } from "@/lib/sanity/client";
import { servicesPageQuery } from "@/lib/sanity/queries";
import type { ServicesPageData } from "@/lib/sanity/types";

export const metadata: Metadata = {
  title: "Services | SRF Collective",
};

export default async function ServicesPage() {
  // Published content only — same as the client-wide default, stated
  // explicitly here per the project's perspective convention.
  const { page, services } = await client.fetch<ServicesPageData>(
    servicesPageQuery,
    {},
    { perspective: "published" },
  );

  return <Services page={page} services={services} />;
}
