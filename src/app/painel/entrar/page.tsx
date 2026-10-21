import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Marca } from "@/components/marca";
import { EntrarDemo } from "@/components/painel/entrar-demo";
import { FormEntrar } from "@/components/painel/form-entrar";

export const metadata: Metadata = { title: "Entrar" };

export default function Entrar() {
  return (
    <main id="conteudo" className="grid flex-1 place-items-center px-margem py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex w-fit items-center gap-1.5 text-[14px] font-semibold text-suave underline-offset-4 transition-colors hover:text-tinta hover:underline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          Voltar ao site
        </Link>
        <Link href="/" className="mt-6 inline-flex items-center gap-2.5 font-titulo text-[17px] font-semibold tracking-[-0.03em]">
          <Marca tamanho={32} />
          Chave Leve
        </Link>
        <h1 className="mt-8 text-[30px]">Entrar no painel</h1>
        <p className="mt-2 text-suave">Para a equipe da imobiliária.</p>
        <Suspense fallback={<div className="mt-8 h-[260px]" />}>
          <FormEntrar />
        </Suspense>
        <p className="mt-6 text-[14px] text-suave">Esqueceu a senha? Peça ao dono da imobiliária para gerar uma nova.</p>
        <EntrarDemo />
      </div>
    </main>
  );
}
