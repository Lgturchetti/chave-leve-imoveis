"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { UFSM } from "@/data/site";

type Ponto = { lat: number; lon: number } | null;

// Toque (ou clique) marca o centro da região; o site mostra um círculo de 300 m, nunca o ponto exato.
export function MapaEscolherLeaflet({ ponto, aoMudar, invalido }: { ponto: Ponto; aoMudar: (p: { lat: number; lon: number }) => void; invalido?: boolean }) {
  const caixa = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const circulo = useRef<L.Circle | null>(null);
  const aoMudarRef = useRef(aoMudar);

  useEffect(() => {
    aoMudarRef.current = aoMudar;
  }, [aoMudar]);

  useEffect(() => {
    if (!caixa.current) return;
    const centro = ponto ?? { lat: -29.695, lon: -53.77 };
    const m = L.map(caixa.current, { scrollWheelZoom: false }).setView([centro.lat, centro.lon], ponto ? 15 : 12);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(m);
    L.marker([UFSM.lat, UFSM.lon], { icon: L.divIcon({ className: "", html: '<span class="pino-ufsm">UFSM</span>', iconSize: [0, 0] }), interactive: false, keyboard: false }).addTo(m);
    m.on("click", (e: L.LeafletMouseEvent) => aoMudarRef.current({ lat: e.latlng.lat, lon: e.latlng.lng }));
    mapa.current = m;
    return () => {
      m.remove();
      mapa.current = null;
      circulo.current = null;
    };
    // O mapa nasce uma vez; o círculo acompanha o ponto no efeito abaixo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const m = mapa.current;
    if (!m || !ponto) return;
    if (circulo.current) circulo.current.setLatLng([ponto.lat, ponto.lon]);
    else circulo.current = L.circle([ponto.lat, ponto.lon], { radius: 300, color: "#2b4dff", weight: 2, fillColor: "#2b4dff", fillOpacity: 0.15, interactive: false }).addTo(m);
  }, [ponto]);

  return (
    <div
      ref={caixa}
      className={`relative z-0 mt-2 aspect-[4/3] overflow-hidden rounded-foto border bg-[#e8ecf1] sm:aspect-[16/9] ${invalido ? "border-red-700" : "border-linha"}`}
      role="application"
      aria-label="Mapa: toque para marcar a região do imóvel"
    />
  );
}
