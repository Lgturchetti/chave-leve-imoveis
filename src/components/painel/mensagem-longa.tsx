"use client";

import { useState } from "react";

// Mensagem de contato: mostra 4 linhas e um botão para ler o resto (mensagem longa não empurra a lista)
export function MensagemLonga({ texto }: { texto: string }) {
  const [aberta, setAberta] = useState(false);
  const longa = texto.length > 180 || texto.split("\n").length > 4;

  return (
    <div className="mt-3 rounded-2xl bg-fundo p-3 text-[15px]">
      <p className={`whitespace-pre-line [overflow-wrap:anywhere] ${longa && !aberta ? "line-clamp-4" : ""}`}>{texto}</p>
      {longa && (
        <button type="button" aria-expanded={aberta} onClick={() => setAberta((a) => !a)} className="mt-1.5 cursor-pointer text-[14px] font-semibold text-acao underline-offset-4 hover:underline">
          {aberta ? "Mostrar menos" : "Ler mensagem inteira"}
        </button>
      )}
    </div>
  );
}
