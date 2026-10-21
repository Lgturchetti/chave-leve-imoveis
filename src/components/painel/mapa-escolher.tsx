"use client";

import dynamic from "next/dynamic";

// Mapa para marcar a região aproximada do imóvel. Carrega só no navegador.
export const MapaEscolher = dynamic(() => import("@/components/painel/mapa-escolher-leaflet").then((m) => m.MapaEscolherLeaflet), {
  ssr: false,
  loading: () => <div className="mt-2 aspect-[4/3] animate-pulse rounded-foto bg-[#e8ecf1] sm:aspect-[16/9]" />,
});
