"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useState, useTransition } from "react";
import { apagarImovel } from "@/app/painel/(app)/imoveis/acoes";

// Apagar é para cadastro errado. Imóvel que foi alugado deve ir para "Alugado" (guarda o histórico).
export function BotaoApagarImovel({ id, titulo }: { id: string; titulo: string }) {
  const [erro, setErro] = useState("");
  const [apagando, iniciar] = useTransition();

  return (
    <div className="rounded-cartao border border-red-800/20 p-5 sm:p-6">
      <h2 className="text-[18px]">Apagar imóvel</h2>
      <p className="mt-1 text-[15px] text-suave">Só para cadastro feito por engano. Se foi alugado, mude a situação para “Alugado”.</p>
      <AlertDialog.Root>
        <AlertDialog.Trigger className="botao botao-pequeno mt-4 border-red-800/30 bg-superficie text-red-800">Apagar imóvel</AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-tinta/40 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-superficie p-6 shadow-flutua transition-[opacity,scale] duration-200 ease-out data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0 sem-movimento">
            <AlertDialog.Title className="font-titulo text-[20px] font-semibold tracking-[-0.03em]">Apagar este imóvel?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-[15px] text-suave [overflow-wrap:anywhere]">
              “{titulo}” sai do site e do painel, com as fotos e os pedidos de visita. Não dá para desfazer.
            </AlertDialog.Description>
            {erro && (
              <p role="alert" className="mt-3 text-[14px] text-red-800">
                {erro}
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <AlertDialog.Close className="botao botao-contorno botao-pequeno">Cancelar</AlertDialog.Close>
              <button
                type="button"
                disabled={apagando}
                onClick={() =>
                  iniciar(async () => {
                    const r = await apagarImovel(id);
                    if (r?.erro) setErro(r.erro);
                  })
                }
                className="botao botao-pequeno bg-red-800 text-white"
              >
                {apagando ? "Apagando…" : "Apagar de vez"}
              </button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
