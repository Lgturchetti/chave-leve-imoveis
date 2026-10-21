"use client";

import "leaflet/dist/leaflet.css";
import type { Map as MapaLeaflet, Marker } from "leaflet";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { ImovelCompleto } from "@/data/imoveis";
import { brl } from "@/data/formatar";
import { UFSM } from "@/data/site";

// Mapa de Santa Maria (Leaflet + OpenStreetMap) com o custo total em cada pino.
// O Leaflet só existe no navegador, então é carregado dentro do efeito.
// Os pinos ficam na REGIÃO aproximada do imóvel (o endereço exato nunca vai para o público).
export function MapaImoveis({ itens, ativo, className = "" }: { itens: ImovelCompleto[]; ativo: string | null; className?: string }) {
  const caixa = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaLeaflet | null>(null);
  const pinos = useRef<Marker[]>([]);
  const L = useRef<typeof import("leaflet") | null>(null);
  const router = useRouter();

  // Cria o mapa uma vez
  useEffect(() => {
    let cancelado = false;
    import("leaflet").then((mod) => {
      if (cancelado || !caixa.current || mapa.current) return;
      L.current = mod;
      const m = mod.map(caixa.current, { zoomControl: false, attributionControl: true }).setView([-29.703, -53.765], 13);
      mod.control.zoom({ position: "topright" }).addTo(m);
      mod.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(m);
      mod.marker([UFSM.lat, UFSM.lon], { icon: mod.divIcon({ className: "", html: '<span class="pino-ufsm">UFSM</span>', iconSize: [0, 0] }), keyboard: false, interactive: false }).addTo(m);
      mapa.current = m;
      desenhar();
    });
    return () => {
      cancelado = true;
      mapa.current?.remove();
      mapa.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cria uma vez; os pinos são redesenhados no efeito abaixo
  }, []);

  function desenhar() {
    const mod = L.current;
    const m = mapa.current;
    if (!mod || !m) return;
    pinos.current.forEach((p) => p.remove());
    pinos.current = itens.map((it) =>
      mod
        .marker([it.regiao.lat, it.regiao.lon], {
          icon: mod.divIcon({ className: "", html: `<span class="pino" data-pino="${it.codigo}">R$ ${brl(it.total)}</span>`, iconSize: [0, 0] }),
          title: `${it.titulo}, R$ ${brl(it.total)} por mês`,
          keyboard: true,
        })
        .on("click", () => router.push(`/imovel/${it.codigo}`))
        .addTo(m),
    );
    // Enquadra os imóveis filtrados (e a UFSM, que serve de referência)
    const pontos = [...itens.map((it) => [it.regiao.lat, it.regiao.lon] as [number, number]), [UFSM.lat, UFSM.lon] as [number, number]];
    // No celular a gaveta cobre a parte de baixo do mapa: mais folga embaixo
    const celular = window.matchMedia("(max-width: 1023px)").matches;
    m.fitBounds(mod.latLngBounds(pontos), { paddingTopLeft: [40, 40], paddingBottomRight: [40, celular ? 150 : 40], maxZoom: 15, animate: false });
  }

  // Redesenha quando o filtro muda
  // eslint-disable-next-line react-hooks/exhaustive-deps -- desenhar lê `itens` atual
  useEffect(desenhar, [itens]);

  // Destaca o pino do cartão sob o mouse
  useEffect(() => {
    caixa.current?.querySelectorAll<HTMLElement>("[data-pino]").forEach((p) => p.toggleAttribute("data-ativo", p.dataset.pino === ativo));
  }, [ativo, itens]);

  return <div ref={caixa} className={`z-0 bg-[#e8ecf1] ${className}`} role="region" aria-label="Mapa dos imóveis" />;
}
