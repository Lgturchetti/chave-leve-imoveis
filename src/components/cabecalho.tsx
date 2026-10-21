"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFavoritos } from "@/components/favoritos";
import { Marca } from "@/components/marca";
import { site } from "@/data/site";

const paginas = [
  { href: "/como-funciona", nome: "Como funciona" },
  { href: "/proprietarios", nome: "Para proprietários" },
];

export function Cabecalho() {
  const pathname = usePathname();
  const { lista } = useFavoritos();

  return (
    <header className="sticky top-0 z-30 bg-fundo/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-margem">
        <Link href="/" className="flex min-w-0 items-center gap-2" aria-label={`${site.nome}, página inicial`}>
          <Marca />
          <span className="truncate font-titulo text-[20px] font-semibold tracking-[-0.03em]" translate="no">
            {site.nomeCurto}
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-6 text-[15px] md:flex">
          {paginas.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              aria-current={pathname === p.href ? "page" : undefined}
              className="text-suave transition-colors duration-150 hover:text-tinta aria-[current=page]:text-tinta"
            >
              {p.nome}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/favoritos" className="botao botao-contorno botao-pequeno" aria-label={`Favoritos: ${lista.length}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className={lista.length ? "fill-coracao" : "fill-none"} stroke={lista.length ? "none" : "currentColor"} strokeWidth="2">
              <path d="M12 21s-7-4.6-9.3-9A5 5 0 0 1 12 6a5 5 0 0 1 9.3 6c-2.3 4.4-9.3 9-9.3 9Z" />
            </svg>
            <span className="tabular-nums">{lista.length}</span>
          </Link>
          <Link href="/painel" className="botao botao-contorno botao-pequeno">
            Entrar
          </Link>
        </div>
      </div>
    </header>
  );
}
