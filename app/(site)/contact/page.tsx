import type { Metadata } from "next";

import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact | SRF Collective",
};

export default function ContactPage() {
  return <ContactForm />;
}
