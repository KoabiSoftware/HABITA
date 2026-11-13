import type { Metadata, Viewport } from "next";
import { SiteShell } from "../components/site-shell";
import { Motion } from "../components/motion";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "HÁBITA · Un lugar a la altura de tu vida",
    template: "%s · HÁBITA",
  },
  description:
    "Conoce HÁBITA, una propuesta de información y orientación inmobiliaria en Trujillo, Perú.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "HÁBITA · Espacios que inspiran",
    description: "Encuentra un lugar a la altura de tu vida.",
    locale: "es_PE",
    type: "website",
    images: [{ url: "/images/hero.webp", width: 1672, height: 941 }],
  },
};
export const viewport: Viewport = { themeColor: "#131414" };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <SiteShell>{children}</SiteShell>
        <Motion />
      </body>
    </html>
  );
}
