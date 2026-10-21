"use client";

import dynamic from "next/dynamic";

// Mapa pequeno do anúncio: só um círculo na região (nunca o endereço exato). Carrega só no navegador.
export const MapaRegiao = dynamic(() => import("@/components/mapa-regiao-leaflet").then((m) => m.MapaRegiaoLeaflet), {
  ssr: false,
  loading: () => <div className="mt-4 aspect-[16/9] animate-pulse rounded-foto bg-[#e8ecf1]" />,
});
