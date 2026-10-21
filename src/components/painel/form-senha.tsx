"use client";

import { useActionState } from "react";
import { trocarSenha, type EstadoSenha } from "@/app/painel/acoes-sessao";
import { ajuda, campo, rotulo } from "@/components/painel/campos";

export function FormSenha() {
  const [estado, acao, enviando] = useActionState<EstadoSenha, FormData>(trocarSenha, {});
  return (
    <form action={acao} className="mt-6 grid max-w-sm gap-4">
      {estado.erro && (
        <p role="alert" className="rounded-2xl border border-red-800/30 bg-red-50 p-3 text-[15px] text-red-900">
          {estado.erro}
        </p>
      )}
      <input type="text" name="usuario" autoComplete="username" hidden readOnly />
      <label className={rotulo}>
        Senha nova
        <input name="nova" type="password" autoComplete="new-password" minLength={10} maxLength={72} required className={campo} />
        <span className={`${ajuda} block font-normal`}>Pelo menos 10 caracteres. Uma frase curta funciona bem.</span>
      </label>
      <label className={rotulo}>
        Repita a senha nova
        <input name="repete" type="password" autoComplete="new-password" minLength={10} maxLength={72} required className={campo} />
      </label>
      <button type="submit" disabled={enviando} className="botao botao-acao mt-2">
        {enviando ? "Salvando…" : "Salvar senha nova"}
      </button>
    </form>
  );
}
