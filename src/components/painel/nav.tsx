"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Marca } from "@/components/marca";
import { sair } from "@/app/painel/acoes-sessao";

const icones = {
  inicio: <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z" />,
  imoveis: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4" />
    </>
  ),
  visitas: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </>
  ),
  proprietarios: (
    <>
      <path d="M3 11 12 4l9 7" />
      <path d="M8 21v-5a4 4 0 0 1 8 0v5" />
      <circle cx="12" cy="12" r="0.5" />
    </>
  ),
  equipe: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 2 6 5.5" />
    </>
  ),
  conta: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </>
  ),
};

type Item = { href: string; nome: string; icone: keyof typeof icones; donoSo?: boolean; semDemo?: boolean; celular?: boolean };
const itens: Item[] = [
  { href: "/painel", nome: "Início", icone: "inicio", celular: true },
  { href: "/painel/imoveis", nome: "Imóveis", icone: "imoveis", celular: true },
  { href: "/painel/visitas", nome: "Visitas", icone: "visitas", celular: true },
  { href: "/painel/proprietarios", nome: "Proprietários", icone: "proprietarios", donoSo: true },
  { href: "/painel/equipe", nome: "Equipe", icone: "equipe", donoSo: true, semDemo: true },
  { href: "/painel/conta", nome: "Conta", icone: "conta", celular: true },
];

const Icone = ({ nome }: { nome: keyof typeof icones }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {icones[nome]}
  </svg>
);

export function NavPainel({ dono, demo, nome }: { dono: boolean; demo: boolean; nome: string }) {
  return <NavBase dono={dono} demo={demo} nome={nome} caminho={usePathname()} />;
}

// Enquanto o login é conferido: mesma barra, sem item marcado (não lê o endereço)
export function NavEsqueleto() {
  return <NavBase dono={false} demo={false} nome="" caminho="" />;
}

function NavBase({ dono, demo, nome, caminho }: { dono: boolean; demo: boolean; nome: string; caminho: string }) {
  const ativo = (href: string) => (href === "/painel" ? caminho === href : caminho.startsWith(href));
  const visiveis = itens.filter((i) => (!i.donoSo || dono) && !(i.semDemo && demo));

  return (
    <>
      {/* Computador: barra lateral */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-linha bg-superficie px-4 py-5 lg:flex">
        <Link href="/painel" className="flex items-center gap-2.5 px-2 font-titulo text-[17px] font-semibold tracking-[-0.03em]">
          <Marca tamanho={30} />
          Chave Leve
          <span className="ml-auto rounded-full bg-fundo px-2 py-0.5 font-sans text-[12px] font-semibold tracking-normal text-suave">Painel</span>
        </Link>
        <nav aria-label="Painel" className="mt-8 grid gap-1">
          {visiveis.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              aria-current={ativo(i.href) ? "page" : undefined}
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-semibold text-suave transition-colors duration-150 hover:bg-fundo hover:text-tinta aria-[current=page]:bg-acao/10 aria-[current=page]:text-acao"
            >
              <Icone nome={i.icone} />
              {i.nome}
            </Link>
          ))}
        </nav>
        <div className="mt-auto grid gap-2 border-t border-linha px-2 pt-4">
          <p className="truncate text-[14px] font-semibold" title={nome}>
            {nome || " "}
          </p>
          <div className="flex items-center gap-4 text-[14px]">
            <Link href="/" className="text-suave underline-offset-4 hover:underline">
              Ver site
            </Link>
            <form action={sair}>
              <button type="submit" className="cursor-pointer text-suave underline-offset-4 hover:underline">
                Sair
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Celular: topo simples + abas embaixo */}
      <header className="flex items-center gap-2.5 px-margem pb-2 pt-[calc(14px+env(safe-area-inset-top))] lg:hidden">
        <Marca tamanho={28} />
        <span className="font-titulo text-[16px] font-semibold tracking-[-0.03em]">Painel</span>
      </header>
      <nav
        aria-label="Painel"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-linha bg-superficie/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {visiveis
          .filter((i) => i.celular)
          .map((i) => (
            <Link
              key={i.href}
              href={i.href}
              aria-current={ativo(i.href) || (i.href === "/painel/conta" && (caminho.startsWith("/painel/equipe") || caminho.startsWith("/painel/proprietarios") || caminho.startsWith("/painel/senha"))) ? "page" : undefined}
              className="flex select-none flex-col items-center gap-1 pb-2 pt-2.5 text-[12px] font-semibold text-suave transition-transform duration-100 active:scale-95 aria-[current=page]:text-acao"
            >
              <Icone nome={i.icone} />
              {i.nome}
            </Link>
          ))}
      </nav>
    </>
  );
}
