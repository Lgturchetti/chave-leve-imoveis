"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { CartaoImovel } from "@/components/cartao-imovel";
import { Filtros } from "@/components/filtros";
import type { ImovelCompleto } from "@/data/imoveis";
import { aplicar, lerFiltro } from "@/data/filtro";
import { brl, categorias, plural } from "@/data/formatar";

// O mapa só carrega quando a pessoa abre (Leaflet é pesado e só existe no navegador)
const MapaImoveis = dynamic(() => import("@/components/mapa-imoveis").then((m) => m.MapaImoveis), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#e8ecf1]" />,
});

// Lê o filtro do endereço. Separado da tela para que o HTML já venha com a grade completa
// (a tela sem filtro vira o "fallback" do Suspense) — nada de página vazia até o JavaScript carregar.
export function Busca({ imoveis }: { imoveis: ImovelCompleto[] }) {
  const params = useSearchParams();
  return <BuscaTela imoveis={imoveis} consulta={params.toString()} />;
}

export function BuscaTela({ imoveis, consulta }: { imoveis: ImovelCompleto[]; consulta: string }) {
  const params = useMemo(() => new URLSearchParams(consulta), [consulta]);
  const router = useRouter();
  const pathname = usePathname();
  const filtro = lerFiltro(params);
  const mapa = params.get("mapa") === "1";
  const itens = useMemo(() => aplicar(imoveis, filtro), [imoveis, params]); // eslint-disable-line react-hooks/exhaustive-deps
  const [ativo, setAtivo] = useState<string | null>(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  // Escreve o filtro no endereço (dá para compartilhar; o "voltar" funciona). Sem rolar a página.
  const mudar = (novo: Record<string, string | number | null>, avancar = false) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(novo)) {
      if (v === null || v === "" || v === 0 || v === "todos" || (k === "ordem" && v === "recentes")) p.delete(k);
      else p.set(k, String(v));
    }
    const qs = p.toString();
    // Filtros trocam o endereço; abrir/fechar o mapa AVANÇA no histórico (o "voltar" do celular volta para a lista)
    const destino = qs ? `${pathname}?${qs}` : pathname;
    if (avancar) router.push(destino, { scroll: false });
    else router.replace(destino, { scroll: false });
  };

  const bairros = useMemo(() => [...new Set(imoveis.map((m) => m.bairro))].sort(), [imoveis]);
  const resumo = [filtro.bairro || "Toda Santa Maria", filtro.ate ? `até R$ ${brl(filtro.ate)}` : "Qualquer preço", filtro.quartos ? `${filtro.quartos}+ quartos` : "Quartos"];
  const filtrosAtivos = [filtro.bairro, filtro.ate, filtro.quartos].filter(Boolean).length;

  const vazio = (
    <div className="col-span-full rounded-cartao bg-superficie p-10 text-center">
      <h2 className="text-[22px]">Nenhum imóvel com esses filtros.</h2>
      <p className="mt-2 text-suave">
        {filtro.ate ? `Tente aumentar o preço para até R$ ${brl(filtro.ate + 500)}` : filtro.categoria !== "todos" ? "Tente tirar a categoria" : "Tente outro bairro"} ou{" "}
        <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="font-semibold text-acao underline-offset-4 hover:underline">
          limpe os filtros
        </button>
        .
      </p>
    </div>
  );

  const grade = (cols: string) => (
    <div className={`grid gap-x-5 gap-y-7 ${cols}`}>
      {itens.length ? itens.map((m, i) => <CartaoImovel key={m.codigo} m={m} prioridade={i < 2} aoPassar={setAtivo} />) : vazio}
    </div>
  );

  return (
    <>
      <div className="mx-auto max-w-[1240px] px-margem">
        {!mapa && <h1 className="entra pt-6 text-[clamp(30px,5vw,56px)] sm:pt-8 max-w-[15ch]">Alugue sem precisar ir até a imobiliária.</h1>}

        {/* Busca em pílula: abre os filtros (no celular, um painel que sobe de baixo) */}
        <button
          type="button"
          onClick={() => setFiltrosAbertos(true)}
          className={`entra flex w-full max-w-[760px] items-center rounded-full border border-linha bg-superficie text-left shadow-suave transition-[border-color] duration-150 hover:border-tinta/25 ${mapa ? "mt-3" : "mt-5"}`}
          style={{ "--atraso": "60ms" } as React.CSSProperties}
        >
          {/* Nome lido = "Abrir filtros" + o texto visível (o leitor de tela fala o mesmo que a tela mostra) */}
          <span className="sr-only">Abrir filtros.</span>
          {["Onde", "Até", "Quartos"].map((rotulo, i) => (
            <span key={rotulo} className={`min-w-0 flex-1 border-linha px-5 py-2.5 ${i ? "hidden border-l sm:block" : ""}`}>
              <span className="block text-[12px] font-semibold">{rotulo}</span>
              <span className="block truncate text-[15px] text-suave">{resumo[i]}</span>
            </span>
          ))}
          {filtrosAtivos > 0 && <span className="mr-1 rounded-full bg-limao px-2 py-0.5 text-[12px] font-semibold sm:hidden">{filtrosAtivos}</span>}
          <span className="m-1.5 grid size-12 shrink-0 place-items-center rounded-full bg-acao text-white" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </span>
        </button>

        {/* Categorias: filtram na hora */}
        <div className="-mx-[max(1rem,env(safe-area-inset-left,0px))] mt-4 flex gap-6 overflow-x-auto border-b border-linha px-margem [scrollbar-width:none]" role="group" aria-label="Categorias">
          {categorias.map((c) => {
            const marcada = filtro.categoria === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={marcada}
                onClick={() => mudar({ categoria: c.id })}
                className="grid shrink-0 cursor-pointer select-none justify-items-center gap-1.5 border-b-2 border-transparent px-0.5 pb-2.5 pt-2 text-[13px] font-medium text-suave transition-colors duration-150 hover:text-tinta aria-pressed:border-acao aria-pressed:text-acao"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: c.icone }} />
                {c.nome}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-[14px] text-suave" aria-live="polite">
          {plural(itens.length, "imóvel", "imóveis")}
          {filtro.ordem === "preco" ? ", do menor preço" : filtro.ordem === "ufsm" ? ", mais perto da UFSM primeiro" : ", mais recentes primeiro"}
        </p>
      </div>

      {mapa ? (
        <MapaComLista itens={itens} ativo={ativo} grade={grade} />
      ) : (
        <div className="mx-auto max-w-[1240px] px-margem pb-32 pt-4">{grade("grid-cols-1 min-[560px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4")}</div>
      )}

      {/* Botão flutuante: alterna lista e mapa */}
      <button
        type="button"
        onClick={() => mudar({ mapa: mapa ? null : "1" }, true)}
        className={`botao botao-escuro fixed left-1/2 ${mapa ? "bottom-[calc(8.5rem+env(safe-area-inset-bottom))] lg:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]" : "bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"} z-20 -translate-x-1/2 shadow-flutua active:scale-[0.97]`}
      >
        {mapa ? "Mostrar lista" : "Mostrar mapa"}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          {mapa ? <path d="M4 6h16M4 12h16M4 18h16" /> : <><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path d="M9 4v14M15 6v14" /></>}
        </svg>
      </button>

      <Filtros aberto={filtrosAbertos} aoMudarAberto={setFiltrosAbertos} filtro={filtro} bairros={bairros} imoveis={imoveis} aoAplicar={mudar} />
    </>
  );
}

// Desktop: lista à esquerda, mapa à direita. Celular: mapa na tela e a lista numa gaveta que se arrasta.
function MapaComLista({ itens, ativo, grade }: { itens: ImovelCompleto[]; ativo: string | null; grade: (cols: string) => React.ReactNode }) {
  const [aberta, setAberta] = useState(false);
  const gaveta = useRef<HTMLDivElement>(null);
  const toque = useRef({ y0: 0, t0: 0, base: 0, ativo: false });
  const ESPIA = 120; // quanto da gaveta aparece fechada

  const inicio = (e: React.PointerEvent) => {
    const el = gaveta.current;
    if (!el) return;
    toque.current = { y0: e.clientY, t0: performance.now(), base: aberta ? 0 : el.offsetHeight - ESPIA, ativo: true };
    el.style.transition = "none";
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const mover = (e: React.PointerEvent) => {
    const el = gaveta.current;
    if (!el || !toque.current.ativo) return;
    const d = Math.max(0, Math.min(el.offsetHeight - ESPIA, toque.current.base + e.clientY - toque.current.y0));
    el.style.transform = `translateY(${d}px)`;
  };
  const fim = (e: React.PointerEvent) => {
    const el = gaveta.current;
    if (!el || !toque.current.ativo) return;
    toque.current.ativo = false;
    el.style.transition = "";
    el.style.transform = "";
    const dy = e.clientY - toque.current.y0;
    const v = dy / Math.max(1, performance.now() - toque.current.t0);
    // Peteleco (velocidade) ou distância decide; um toque só alterna
    if (Math.abs(dy) < 6) setAberta((a) => !a);
    else if (v < -0.4 || dy < -80) setAberta(true);
    else if (v > 0.4 || dy > 80) setAberta(false);
  };

  return (
    <div className="relative mt-3 h-[calc(100dvh-var(--altura-cabecalho)-200px)] min-h-[420px] lg:grid lg:h-[calc(100dvh-var(--altura-cabecalho)-190px)] lg:grid-cols-[minmax(0,560px)_1fr]">
      <div
        ref={gaveta}
        data-aberta={aberta || undefined}
        className="absolute inset-x-0 bottom-0 z-10 flex h-[88%] translate-y-[calc(100%-120px)] flex-col rounded-t-[22px] bg-fundo shadow-flutua transition-transform duration-[380ms] ease-gaveta data-aberta:translate-y-0 motion-reduce:transition-none lg:static lg:h-auto lg:translate-y-0 lg:rounded-none lg:shadow-none"
      >
        <button
          type="button"
          onPointerDown={inicio}
          onPointerMove={mover}
          onPointerUp={fim}
          onPointerCancel={fim}
          aria-expanded={aberta}
          className="shrink-0 cursor-grab touch-none py-2.5 text-center text-[15px] font-semibold lg:hidden"
        >
          <span className="mx-auto mb-2 block h-1 w-10 rounded-full bg-tinta/20" aria-hidden="true" />
          {plural(itens.length, "imóvel nesta região", "imóveis nesta região")}
        </button>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-margem pb-28 pt-2 lg:pt-4">{grade("grid-cols-1 min-[560px]:grid-cols-2")}</div>
      </div>
      <MapaImoveis itens={itens} ativo={ativo} className="absolute inset-0 lg:static lg:h-full" />
    </div>
  );
}
