import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Marca } from "@/components/marca";
import { FormEntrar } from "@/components/painel/form-entrar";

export const metadata: Metadata = { title: "Entrar" };

export default function Entrar() {
  return (
    <main id="conteudo" className="grid flex-1 place-items-center px-margem py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-2.5 font-titulo text-[17px] font-semibold tracking-[-0.03em]">
          <Marca tamanho={32} />
          Chave Leve
        </Link>
        <h1 className="mt-8 text-[30px]">Entrar no painel</h1>
        <p className="mt-2 text-suave">Para a equipe da imobiliária.</p>
        <Suspense fallback={<div className="mt-8 h-[260px]" />}>
          <FormEntrar />
        </Suspense>
        <p className="mt-6 text-[14px] text-suave">Esqueceu a senha? Peça ao dono da imobiliária para gerar uma nova.</p>
      </div>
    </main>
  );
}
