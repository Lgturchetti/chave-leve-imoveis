"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { UFSM } from "@/data/site";

export function MapaRegiaoLeaflet({ lat, lon }: { lat: number; lon: number }) {
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!caixa.current) return;
    // Sem arrastar com um dedo no celular (não prende a rolagem da página); zoom pelos botões
    const m = L.map(caixa.current, { scrollWheelZoom: false, dragging: !L.Browser.mobile, zoomControl: true }).setView([lat, lon], 15);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(m);
    L.circle([lat, lon], { radius: 300, color: "#2b4dff", weight: 2, fillColor: "#2b4dff", fillOpacity: 0.12 }).addTo(m);
    L.marker([UFSM.lat, UFSM.lon], { icon: L.divIcon({ className: "", html: '<span class="pino-ufsm">UFSM</span>', iconSize: [0, 0] }), interactive: false, keyboard: false }).addTo(m);
    return () => {
      m.remove();
    };
  }, [lat, lon]);

  return <div ref={caixa} className="relative z-0 mt-4 aspect-[16/9] overflow-hidden rounded-foto bg-[#e8ecf1]" role="region" aria-label="Mapa com a região aproximada do imóvel" />;
}
