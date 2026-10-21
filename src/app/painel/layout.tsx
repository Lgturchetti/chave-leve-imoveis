import type { Metadata } from "next";

// Painel da equipe: fora do Google e sem cache no navegador de dados de ninguém
export const metadata: Metadata = {
  title: { default: "Painel", template: "%s — Painel Chave Leve" },
  robots: { index: false, follow: false },
};

export default function LayoutPainel({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh flex-col bg-fundo">{children}</div>;
}
