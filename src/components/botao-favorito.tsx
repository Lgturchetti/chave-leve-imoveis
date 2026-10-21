"use client";

import { useFavoritos } from "@/components/favoritos";

export function BotaoFavorito({ codigo, titulo, className = "", solido }: { codigo: string; titulo: string; className?: string; solido?: boolean }) {
  const { tem, alternar } = useFavoritos();
  const marcado = tem(codigo);
  return (
    <button
      type="button"
      onClick={() => alternar(codigo)}
      aria-pressed={marcado}
      aria-label={marcado ? `Tirar ${titulo} dos favoritos` : `Favoritar ${titulo}`}
      className={`coracao grid size-11 cursor-pointer place-items-center rounded-full ${solido ? "bg-superficie shadow-suave" : ""} ${className}`}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" className={marcado ? "fill-coracao" : solido ? "fill-transparent" : "fill-tinta/35"} stroke={solido && !marcado ? "#0b1220" : "#fff"} strokeWidth="2">
        <path d="M12 21s-7-4.6-9.3-9A5 5 0 0 1 12 6a5 5 0 0 1 9.3 6c-2.3 4.4-9.3 9-9.3 9Z" />
      </svg>
    </button>
  );
}
