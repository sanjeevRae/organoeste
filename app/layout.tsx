import type { Metadata } from "next";

import { SITE_URL } from "@/lib/blog";
import "./site.css";

/** Social preview image; override per deployment with NEXT_PUBLIC_OG_IMAGE. */
const OG_IMAGE = process.env.NEXT_PUBLIC_OG_IMAGE || "/images/d-3599093_1_17814623476a2ef54b5b726.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Grupo Organoeste Ltda",
  description:
    "Coleta licenciada de resíduos orgânicos, compostagem própria e adubo orgânico de alta performance. Um único ecossistema, da indústria ao campo.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: [{ url: "/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Grupo Organoeste Ltda",
    description:
      "Coleta licenciada de resíduos orgânicos, compostagem própria e adubo orgânico de alta performance.",
    locale: "pt_BR",
    type: "website",
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <div id="site">{children}</div>
      </body>
    </html>
  );
}
