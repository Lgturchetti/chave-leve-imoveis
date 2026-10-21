"use client";

import { useState, useTransition } from "react";
import { mudarStatus } from "@/app/painel/(app)/acoes-pedidos";

type Botao = { status: string; nome: string; principal?: boolean };

// Botões de situação de um pedido + atalho para o WhatsApp
export function AcoesPedido({ tabela, id, botoes, whatsapp }: { tabela: "visitas" | "proprietarios"; id: string; botoes: Botao[]; whatsapp: string }) {
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState("");

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="botao botao-pequeno bg-[#1a7f45] text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3a2.8 2.8 0 0 0-.9 2.1c0 1.2.9 2.4 1 2.6.1.2 1.8 2.7 4.3 3.8 1.6.7 2.2.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.2-.3-.2-.5-.3Z" />
          </svg>
          WhatsApp
        </a>
        {botoes.map((b) => (
          <button
            key={b.status}
            type="button"
            disabled={pendente}
            onClick={() =>
              iniciar(async () => {
                setErro("");
                const r = await mudarStatus(tabela, id, b.status);
                if (r.erro) setErro(r.erro);
              })
            }
            // Ação secundária (cancelar, descartar, reabrir) vira texto à direita: cabe na mesma linha no celular
            className={b.principal ? "botao botao-pequeno botao-acao" : "botao botao-pequeno ml-auto px-3 text-suave underline-offset-4 transition-colors hover:text-tinta hover:underline"}
          >
            {b.nome}
          </button>
        ))}
      </div>
      {erro && (
        <p role="alert" className="mt-2 text-[14px] text-red-800">
          {erro}
        </p>
      )}
    </div>
  );
}
