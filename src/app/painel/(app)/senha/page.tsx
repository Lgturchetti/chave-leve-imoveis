import type { Metadata } from "next";
import { Suspense } from "react";
import { FormSenha } from "@/components/painel/form-senha";
import { exigirSessao } from "@/lib/painel";

export const metadata: Metadata = { title: "Trocar senha" };

async function Conteudo() {
  const { perfil } = await exigirSessao({ trocandoSenha: true });
  return (
    <>
      <h1 className="text-[clamp(26px,4vw,34px)]">{perfil.trocar_senha ? "Crie a sua senha" : "Trocar minha senha"}</h1>
      <p className="mt-2 max-w-prose text-suave">
        {perfil.trocar_senha ? "Você entrou com uma senha provisória. Antes de continuar, escolha uma senha só sua." : "A senha nova vale a partir do próximo acesso."}
      </p>
      <FormSenha />
    </>
  );
}

export default function Senha() {
  return (
    <div className="px-margem pt-4 lg:px-10 lg:pt-10">
      <Suspense fallback={<div className="h-64" />}>
        <Conteudo />
      </Suspense>
    </div>
  );
}
