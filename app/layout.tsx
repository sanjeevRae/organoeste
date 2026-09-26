import type { Metadata } from "next";

import "./site.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.organoeste.com.br"),
  title: "Grupo Organoeste Ltda",
  description:
    "Coleta licenciada de resíduos orgânicos, compostagem própria e adubo orgânico de alta performance. Um único ecossistema, da indústria ao campo.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Grupo Organoeste Ltda",
    description:
      "Coleta licenciada de resíduos orgânicos, compostagem própria e adubo orgânico de alta performance.",
    locale: "pt_BR",
    type: "website",
    images: ["/images/d-3599093_1_17814623476a2ef54b5b726.png"],
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
