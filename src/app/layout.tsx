import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Sora } from "next/font/google";
import { site } from "@/data/site";
import "./globals.css";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["600"] });
const hanken = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.nome} — aluguel em Santa Maria`, template: `%s — ${site.nome}` },
  description: site.descricao,
  openGraph: { siteName: site.nome, locale: "pt_BR", type: "website" },
  // Site de PORTFÓLIO (imobiliária fictícia): fora do Google. Para um cliente real, apagar esta linha.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f3f5f8",
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${hanken.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans">
        <a href="#conteudo" className="sr-only z-50 rounded-full bg-tinta px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
