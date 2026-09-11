import type { Metadata } from "next";
import { Bodoni_Moda, Work_Sans } from "next/font/google";

import Nav from "@/components/Nav";

import "../styles/globals.css";

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SRF Collective",
  description: "SRF Collective",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bodoniModa.variable} ${workSans.variable}`}>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
