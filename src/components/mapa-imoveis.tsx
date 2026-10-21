"use client";

import "leaflet/dist/leaflet.css";
import type { Map as MapaLeaflet, Marker } from "leaflet";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { ImovelCompleto } from "@/data/imoveis";
import { brl } from "@/data/formatar";
import { UFSM } from "@/data/site";

type Leaflet = typeof import("leaflet");
type Estado = { mod: Leaflet; m: MapaLeaflet; itens: ImovelCompleto[]; ativo: string | null; caixa: HTMLDivElement; abrir: (codigo: string) => void };

// Mapa de Santa Maria (Leaflet + OpenStreetMap) com o custo total em cada pino.
// O Leaflet só existe no navegador, então é carregado dentro do efeito.
// Os pinos ficam na REGIÃO aproximada do imóvel (o endereço exato nunca vai para o público).
export function MapaImoveis({ itens, ativo, className = "" }: { itens: ImovelCompleto[]; ativo: string | null; className?: string }) {
  const caixa = useRef<HTMLDivElement>(null);
  const mapa = useRef<{ mod: Leaflet; m: MapaLeaflet; pinos: Marker[] } | null>(null);
  const atualRef = useRef({ itens, ativo });
  const router = useRouter();

  const estado = (): Estado | null => {
    const mp = mapa.current;
    if (!mp || !caixa.current) return null;
    return { mod: mp.mod, m: mp.m, itens: atualRef.current.itens, ativo: atualRef.current.ativo, caixa: caixa.current, abrir: (c) => router.push(`/imovel/${c}`) };
  };
  const redesenhar = () => {
    const e = estado();
    if (e && mapa.current) mapa.current.pinos = desenhar(e, mapa.current.pinos);
  };

  // Cria o mapa uma vez
  useEffect(() => {
    let cancelado = false;
    import("leaflet").then((mod) => {
      if (cancelado || !caixa.current || mapa.current) return;
      const m = mod.map(caixa.current, { zoomControl: false, attributionControl: true }).setView([-29.703, -53.765], 13);
      mod.control.zoom({ position: "topright" }).addTo(m);
      mod.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(m);
      mod.marker([UFSM.lat, UFSM.lon], { icon: mod.divIcon({ className: "", html: '<span class="pino-ufsm">UFSM</span>', iconSize: [0, 0] }), keyboard: false, interactive: false }).addTo(m);
      mapa.current = { mod, m, pinos: [] };
      // Ao aproximar ou afastar, os grupos se refazem (perto demais na tela = um grupo só)
      m.on("zoomend", redesenhar);
      const e = estado();
      if (e) {
        enquadrar(e);
        redesenhar();
      }
    });
    return () => {
      cancelado = true;
      mapa.current?.m.remove();
      mapa.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cria uma vez; filtro e destaque têm efeitos próprios
  }, []);

  // Filtro mudou: reenquadra e redesenha
  useEffect(() => {
    atualRef.current = { itens, ativo: atualRef.current.ativo };
    const e = estado();
    if (!e) return;
    enquadrar(e);
    redesenhar();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- estado/redesenhar leem os refs atuais
  }, [itens]);

  // Cartão sob o mouse: destaca o pino ou o grupo que o contém
  useEffect(() => {
    atualRef.current = { itens: atualRef.current.itens, ativo };
    const e = estado();
    if (e) marcarAtivo(e);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- estado lê os refs atuais
  }, [ativo]);

  return <div ref={caixa} className={`z-0 bg-[#e8ecf1] ${className}`} role="region" aria-label="Mapa dos imóveis" />;
}

// Enquadra os imóveis filtrados (e a UFSM, que serve de referência)
function enquadrar({ mod, m, itens }: Estado) {
  const pontos = [...itens.map((it) => [it.regiao.lat, it.regiao.lon] as [number, number]), [UFSM.lat, UFSM.lon] as [number, number]];
  // No celular a gaveta cobre a parte de baixo do mapa: mais folga embaixo
  const celular = window.matchMedia("(max-width: 1023px)").matches;
  m.fitBounds(mod.latLngBounds(pontos), { paddingTopLeft: [40, 40], paddingBottomRight: [40, celular ? 150 : 40], maxZoom: 15, animate: false });
}

// Agrupa pinos que se sobrepõem na tela. Um imóvel sozinho mostra o preço; um grupo mostra "8 imóveis"
// e, ao tocar, o mapa aproxima até os preços se separarem. No zoom máximo não agrupa mais.
function desenhar(e: Estado, antigos: Marker[]): Marker[] {
  const { mod, m, itens, abrir } = e;
  antigos.forEach((p) => p.remove());
  const grupos: { x: number; y: number; itens: ImovelCompleto[] }[] = [];
  const agrupar = m.getZoom() < m.getMaxZoom();
  for (const it of itens) {
    const pt = m.latLngToLayerPoint([it.regiao.lat, it.regiao.lon]);
    // Um pino de preço tem ~75 × 24 px: mais perto que isso, um cobre o outro
    const g = agrupar ? grupos.find((gr) => Math.abs(gr.x - pt.x) < 76 && Math.abs(gr.y - pt.y) < 30) : undefined;
    if (g) {
      g.itens.push(it);
      g.x += (pt.x - g.x) / g.itens.length;
      g.y += (pt.y - g.y) / g.itens.length;
    } else grupos.push({ x: pt.x, y: pt.y, itens: [it] });
  }
  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pinos = grupos.map((g) => {
    if (g.itens.length === 1) {
      const it = g.itens[0];
      return mod
        .marker([it.regiao.lat, it.regiao.lon], {
          icon: mod.divIcon({ className: "", html: `<span class="pino" data-pino="${it.codigo}">R$ ${brl(it.total)}</span>`, iconSize: [0, 0] }),
          title: `${it.titulo}, R$ ${brl(it.total)} por mês`,
          keyboard: true,
        })
        .on("click", () => abrir(it.codigo))
        .addTo(m);
    }
    const limites = mod.latLngBounds(g.itens.map((it) => [it.regiao.lat, it.regiao.lon] as [number, number]));
    return mod
      .marker(m.layerPointToLatLng([g.x, g.y]), {
        icon: mod.divIcon({ className: "", html: `<span class="pino pino-grupo" data-grupo="${g.itens.map((it) => it.codigo).join(" ")}">${g.itens.length} imóveis</span>`, iconSize: [0, 0] }),
        title: `${g.itens.length} imóveis nesta área. Aproximar`,
        keyboard: true,
        riseOnHover: true,
      })
      // Aproxima até separar: enquadra o grupo, com no mínimo 2 níveis a mais de zoom
      .on("click", () => {
        const alvo = Math.min(m.getMaxZoom(), Math.max(m.getZoom() + 2, m.getBoundsZoom(limites, false, mod.point(80, 80))));
        m.setView(limites.getCenter(), alvo, { animate: !reduzir });
      })
      .addTo(m);
  });
  marcarAtivo(e);
  return pinos;
}

function marcarAtivo({ caixa, ativo }: Estado) {
  caixa.querySelectorAll<HTMLElement>("[data-pino]").forEach((p) => p.toggleAttribute("data-ativo", p.dataset.pino === ativo));
  caixa.querySelectorAll<HTMLElement>("[data-grupo]").forEach((p) => p.toggleAttribute("data-ativo", Boolean(ativo && p.dataset.grupo?.split(" ").includes(ativo))));
}
