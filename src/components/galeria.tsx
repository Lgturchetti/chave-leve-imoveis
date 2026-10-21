"use client";

import { Drawer } from "@base-ui/react/drawer";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Foto } from "@/data/imoveis";

// Fotos do anúncio: grade (desktop) ou fotos deslizando (celular). Tocar abre a galeria em tela cheia,
// que fecha arrastando para baixo (gesto da Base UI) e aceita setas do teclado.
export function Galeria({ fotos, titulo }: { fotos: Foto[]; titulo: string }) {
  const [aberta, setAberta] = useState(false);
  const [inicial, setInicial] = useState(0);
  const [atual, setAtual] = useState(0);
  const abrir = (i: number) => {
    setInicial(i);
    setAtual(i);
    setAberta(true);
  };

  return (
    <>
      {/* Celular: fotos deslizando + contador */}
      <div className="relative -mx-[max(1rem,env(safe-area-inset-left,0px))] aspect-[4/3] overflow-hidden bg-[#e5e9f0] sm:hidden">
        <div className="trilho" onScroll={(e) => setAtual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
          {fotos.map((f, i) => (
            <button key={f.url + i} type="button" onClick={() => abrir(i)} className="relative block" aria-label={`Abrir foto ${i + 1} de ${fotos.length}`}>
              <Image src={f.url} alt={f.alt} fill sizes="100vw" preload={i === 0} className="object-cover" />
            </button>
          ))}
        </div>
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-tinta/75 px-2.5 py-1 text-[12px] font-semibold text-white tabular-nums">
          {atual + 1}/{fotos.length}
        </span>
      </div>

      {/* Desktop: 1 grande + até 4 pequenas */}
      <div className="hidden aspect-[2/1] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-cartao sm:grid">
        {fotos.slice(0, 5).map((f, i) => (
          <button
            key={f.url + i}
            type="button"
            onClick={() => abrir(i)}
            className={`group relative overflow-hidden bg-[#e5e9f0] ${i === 0 ? "col-span-2 row-span-2" : ""} ${fotos.length < 5 && i === fotos.length - 1 && i > 0 ? "col-span-2" : ""}`}
            aria-label={`Abrir foto ${i + 1} de ${fotos.length}`}
          >
            <Image src={f.url} alt={f.alt} fill sizes={i === 0 ? "620px" : "310px"} preload={i === 0} className="object-cover transition-[filter] duration-200 group-hover:brightness-90" />
          </button>
        ))}
      </div>

      <Drawer.Root open={aberta} onOpenChange={setAberta}>
        <Drawer.Portal>
          <Drawer.Backdrop className="fixed inset-0 z-50 bg-tinta opacity-[calc(0.98*(1-var(--drawer-swipe-progress)))] transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0" />
          <Drawer.Viewport className="fixed inset-0 z-50">
            <Drawer.Popup className="flex h-full flex-col text-white outline-none [transform:translateY(var(--drawer-swipe-movement-y))] transition-[transform,opacity] duration-300 ease-gaveta data-ending-style:opacity-0 data-ending-style:[transform:translateY(8%)] data-starting-style:opacity-0 data-starting-style:[transform:translateY(4%)] sem-movimento">
              <Drawer.Title className="sr-only">Fotos: {titulo}</Drawer.Title>
              <Tela fotos={fotos} inicial={inicial} />
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

function Tela({ fotos, inicial }: { fotos: Foto[]; inicial: number }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(inicial);
  const ir = (i: number) => {
    const t = trilho.current;
    if (!t) return;
    const alvo = Math.max(0, Math.min(fotos.length - 1, i));
    t.scrollTo({ left: alvo * t.clientWidth, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  // Abre na foto tocada; setas do teclado navegam
  useEffect(() => {
    const t = trilho.current;
    if (t) t.scrollLeft = inicial * t.clientWidth;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") ir(Math.round((trilho.current?.scrollLeft ?? 0) / (trilho.current?.clientWidth ?? 1)) + 1);
      if (e.key === "ArrowLeft") ir(Math.round((trilho.current?.scrollLeft ?? 0) / (trilho.current?.clientWidth ?? 1)) - 1);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só ao abrir
  }, []);

  return (
    <>
      <div className="flex items-center justify-between px-margem pb-2 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <span className="text-[15px] font-semibold tabular-nums">
          {atual + 1} de {fotos.length}
        </span>
        <Drawer.Close className="grid size-11 cursor-pointer place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Fechar fotos">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 3 10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.6" /></svg>
        </Drawer.Close>
      </div>
      <div className="relative min-h-0 flex-1">
        <div ref={trilho} className="trilho" data-base-ui-swipe-ignore onScroll={(e) => setAtual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
          {fotos.map((f, i) => (
            <div key={f.url + i} className="relative">
              <Image src={f.url} alt={f.alt} fill sizes="100vw" className="object-contain" />
            </div>
          ))}
        </div>
        {[-1, 1].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => ir(atual + d)}
            disabled={d < 0 ? atual === 0 : atual === fotos.length - 1}
            aria-label={d < 0 ? "Foto anterior" : "Próxima foto"}
            className={`absolute top-1/2 hidden size-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white text-tinta shadow-flutua transition-[opacity,transform] duration-150 active:scale-95 disabled:opacity-0 sm:grid ${d < 0 ? "left-4" : "right-4"}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d={d < 0 ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} /></svg>
          </button>
        ))}
      </div>
      <p className="px-margem pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 text-center text-[14px] text-white/80">{fotos[atual]?.alt}</p>
    </>
  );
}
