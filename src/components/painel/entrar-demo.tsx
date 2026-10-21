"use client";

import { useActionState } from "react";
import { entrarDemo, type EstadoEntrar } from "@/app/painel/acoes-sessao";

// Entrada da demonstração (portfólio): sem e-mail nem senha
export function EntrarDemo() {
  const [estado, acao, entrando] = useActionState<EstadoEntrar, FormData>(entrarDemo, {});

  return (
    <form action={acao} className="mt-8 rounded-cartao border border-linha bg-superficie p-5">
      <p className="font-semibold">Está conhecendo o projeto?</p>
      <p className="mt-1 text-[15px] text-suave">Entre como visitante e mexa à vontade. Tudo volta ao original às 3h da manhã.</p>
      {estado.erro && (
        <p role="alert" className="mt-3 text-[14px] text-red-800">
          {estado.erro}
        </p>
      )}
      <button type="submit" disabled={entrando} className="botao botao-contorno mt-4 w-full">
        {entrando ? "Abrindo o painel…" : "Ver o painel como visitante"}
      </button>
    </form>
  );
}
