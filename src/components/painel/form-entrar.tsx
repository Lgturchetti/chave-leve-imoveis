"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { entrar, type EstadoEntrar } from "@/app/painel/acoes-sessao";
import { campo, rotulo } from "@/components/painel/campos";

export function FormEntrar() {
  const [estado, acao, enviando] = useActionState<EstadoEntrar, FormData>(entrar, {});
  const aviso = useSearchParams().get("aviso");

  return (
    <form action={acao} className="mt-8 grid gap-4">
      {(estado.erro || aviso === "sem-acesso") && (
        <p role="alert" className="rounded-2xl border border-red-800/30 bg-red-50 p-3 text-[15px] text-red-900">
          {estado.erro ?? "Esta conta não tem acesso ao painel. Fale com o dono da imobiliária."}
        </p>
      )}
      <label className={rotulo}>
        E-mail
        <input name="email" type="email" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} required defaultValue={estado.email} className={campo} />
      </label>
      <label className={rotulo}>
        Senha
        <input name="senha" type="password" autoComplete="current-password" required className={campo} />
      </label>
      <button type="submit" disabled={enviando} className="botao botao-acao mt-2 w-full">
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
