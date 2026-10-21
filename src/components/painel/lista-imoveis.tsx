"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { SeloStatus } from "@/components/painel/selo-status";
import { brl } from "@/data/formatar";

export type ImovelLista = {
  id: string; codigo: string; titulo: string; bairro: string;
  status: "rascunho" | "disponivel" | "reservado" | "alugado";
  total: number; atualizadoEm: string; corretor: string; capa: string | null; qtdFotos: number;
};

const rotulos = { rascunho: "Rascunho", disponivel: "Disponível", reservado: "Reservado", alugado: "Alugado" } as const;
const filtros = [["todos", "Todos"], ["disponivel", "Disponíveis"], ["reservado", "Reservados"], ["rascunho", "Rascunhos"], ["alugado", "Alugados"]] as const;

// Busca sem acento: "nossa senhora" acha "Nossa Senhora"
const normal = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function ListaImoveisPainel({ imoveis, dono }: { imoveis: ImovelLista[]; dono: boolean }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<(typeof filtros)[number][0]>("todos");
  const termo = useDeferredValue(normal(busca.trim()));

  const contagem = useMemo(() => {
    const c: Record<string, number> = { todos: imoveis.length };
    for (const m of imoveis) c[m.status] = (c[m.status] ?? 0) + 1;
    return c;
  }, [imoveis]);

  const lista = imoveis.filter(
    (m) => (filtro === "todos" || m.status === filtro) && (!termo || normal(`${m.codigo} ${m.titulo} ${m.bairro} ${m.corretor}`).includes(termo)),
  );

  if (!imoveis.length) {
    return (
      <div className="mt-8 rounded-cartao border border-dashed border-linha p-8 text-center">
        <p className="font-titulo text-[20px] font-semibold tracking-[-0.03em]">Nenhum imóvel ainda</p>
        <p className="mt-1 text-suave">Cadastre o primeiro: dados, região no mapa e fotos.</p>
        <Link href="/painel/imoveis/novo" className="botao botao-acao mt-5">
          Cadastrar imóvel
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,320px)_1fr] md:items-center">
        <label className="relative block">
          <span className="sr-only">Buscar imóvel</span>
          <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-suave" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Código, título ou bairro"
            enterKeyHint="search"
            className="block w-full rounded-full border border-linha bg-superficie py-3 pl-11 pr-4 placeholder:text-suave focus:border-acao focus:outline-none focus:ring-2 focus:ring-acao/20"
          />
        </label>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0" role="group" aria-label="Filtrar por situação">
          {filtros.map(([id, nome]) => (
            <button
              key={id}
              type="button"
              aria-pressed={filtro === id}
              onClick={() => setFiltro(id)}
              className="botao botao-pequeno shrink-0 border-linha bg-superficie aria-pressed:border-tinta aria-pressed:bg-tinta aria-pressed:text-white"
            >
              {nome}
              <span className="tabular-nums opacity-70">{contagem[id] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-[14px] text-suave" aria-live="polite">
        {lista.length === 1 ? "1 imóvel" : `${lista.length} imóveis`}
      </p>

      {lista.length === 0 ? (
        <p className="mt-6 text-suave">Nenhum imóvel com essa busca.</p>
      ) : (
        <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-2.5">
          {lista.map((m) => (
            <li key={m.id}>
              <Link
                href={`/painel/imoveis/${m.codigo}`}
                className="flex items-center gap-4 rounded-cartao bg-superficie p-3 pr-4 shadow-suave transition-transform duration-150 active:scale-[0.99]"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-[14px] bg-fundo sm:size-20">
                  {m.capa ? (
                    <Image src={m.capa} alt="" fill sizes="80px" className="object-cover" />
                  ) : (
                    <span className="grid size-full place-items-center text-[11px] font-semibold text-suave">Sem foto</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 font-semibold leading-snug [overflow-wrap:anywhere]">{m.titulo}</p>
                    <SeloStatus status={m.status} rotulo={rotulos[m.status]} />
                  </div>
                  <p className="mt-0.5 truncate text-[14px] text-suave">
                    {m.codigo} · {m.bairro}
                    {dono && m.corretor ? ` · ${m.corretor}` : ""}
                  </p>
                  <p className="mt-0.5 text-[14px] tabular-nums">R$ {brl(m.total)}/mês</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
