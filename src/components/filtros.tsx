"use client";

import { Drawer } from "@base-ui/react/drawer";
import { useState } from "react";
import { aplicar, type Filtro } from "@/data/filtro";
import type { ImovelCompleto } from "@/data/imoveis";
import { brl, plural } from "@/data/formatar";

const precos = [0, 1000, 1500, 2000, 2500];
const quartos = [0, 1, 2, 3];
const ordens = [
  { id: "recentes", nome: "Mais recentes" },
  { id: "preco", nome: "Menor preço" },
  { id: "ufsm", nome: "Mais perto da UFSM" },
];

// Filtros: rascunho local; só vai para o endereço ao tocar em "Mostrar N imóveis".
// O botão já mostra quantos imóveis vão aparecer, antes de aplicar.
export function Filtros({
  aberto,
  aoMudarAberto,
  filtro,
  bairros,
  imoveis,
  aoAplicar,
}: {
  aberto: boolean;
  aoMudarAberto: (a: boolean) => void;
  filtro: Filtro;
  bairros: string[];
  imoveis: ImovelCompleto[];
  aoAplicar: (f: Record<string, string | number | null>) => void;
}) {
  const [rascunho, setRascunho] = useState(filtro);
  const [abertoAntes, setAbertoAntes] = useState(aberto);
  if (aberto !== abertoAntes) {
    setAbertoAntes(aberto);
    if (aberto) setRascunho(filtro); // sempre abre com o filtro atual
  }
  const total = aplicar(imoveis, rascunho).length;

  const chip = (marcado: boolean, onClick: () => void, texto: string) => (
    <button
      key={texto}
      type="button"
      aria-pressed={marcado}
      onClick={onClick}
      className="min-h-11 cursor-pointer select-none rounded-full border border-linha bg-fundo px-4 text-[15px] transition-[background-color,color,border-color,transform] duration-150 active:scale-[0.97] aria-pressed:border-acao aria-pressed:bg-acao aria-pressed:text-white"
    >
      {texto}
    </button>
  );

  return (
    <Drawer.Root open={aberto} onOpenChange={aoMudarAberto}>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-tinta opacity-[calc(0.35*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[380ms] ease-gaveta data-ending-style:opacity-0 data-ending-style:duration-200 data-starting-style:opacity-0 data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute" />
        <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <Drawer.Popup className="flex max-h-[90dvh] w-full flex-col rounded-t-[26px] bg-superficie shadow-flutua outline-none [transform:translateY(var(--drawer-swipe-movement-y))] transition-[transform,opacity] duration-[380ms] ease-gaveta data-ending-style:duration-200 data-swiping:select-none max-sm:data-ending-style:[transform:translateY(100%)] max-sm:data-starting-style:[transform:translateY(100%)] sm:w-[560px] sm:rounded-[26px] sm:data-ending-style:scale-[0.98] sm:data-ending-style:opacity-0 sm:data-starting-style:scale-[0.98] sm:data-starting-style:opacity-0 sem-movimento">
            <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-tinta/20 sm:hidden" aria-hidden="true" />
            <div className="flex items-center justify-between px-6 pb-2 pt-4">
              <Drawer.Title className="font-titulo text-[22px] font-semibold tracking-[-0.03em]">Filtros</Drawer.Title>
              <Drawer.Close className="grid size-10 cursor-pointer place-items-center rounded-full hover:bg-fundo" aria-label="Fechar">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 3 10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.6" /></svg>
              </Drawer.Close>
            </div>
            <Drawer.Content className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 pb-4">
              <fieldset>
                <legend className="text-[14px] font-semibold">Onde</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {chip(!rascunho.bairro, () => setRascunho({ ...rascunho, bairro: "" }), "Toda Santa Maria")}
                  {bairros.map((b) => chip(rascunho.bairro === b, () => setRascunho({ ...rascunho, bairro: b }), b))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-[14px] font-semibold">Custo total por mês, até</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {precos.map((p) => chip(rascunho.ate === p, () => setRascunho({ ...rascunho, ate: p }), p ? `R$ ${brl(p)}` : "Qualquer"))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-[14px] font-semibold">Quartos</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {quartos.map((q) => chip(rascunho.quartos === q, () => setRascunho({ ...rascunho, quartos: q }), q ? `${q}+` : "Qualquer"))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-[14px] font-semibold">Ordenar por</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ordens.map((o) => chip(rascunho.ordem === o.id, () => setRascunho({ ...rascunho, ordem: o.id }), o.nome))}
                </div>
              </fieldset>
            </Drawer.Content>
            <div className="flex items-center justify-between gap-3 border-t border-linha px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
              <button type="button" onClick={() => setRascunho({ ...rascunho, bairro: "", ate: 0, quartos: 0, ordem: "recentes" })} className="cursor-pointer text-[15px] font-semibold underline underline-offset-4">
                Limpar
              </button>
              <button
                type="button"
                disabled={total === 0}
                onClick={() => {
                  aoAplicar({ bairro: rascunho.bairro, ate: rascunho.ate, quartos: rascunho.quartos, ordem: rascunho.ordem });
                  aoMudarAberto(false);
                }}
                className="botao botao-acao"
              >
                {total ? `Mostrar ${plural(total, "imóvel", "imóveis")}` : "Nenhum imóvel"}
              </button>
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
