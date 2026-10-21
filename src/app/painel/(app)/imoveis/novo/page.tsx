import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Carregando, Pagina } from "@/components/painel/carregando";
import { FormImovel } from "@/components/painel/form-imovel";
import { exigirSessao } from "@/lib/painel";
import { opcoesFormulario } from "../dados";

export const metadata: Metadata = { title: "Novo imóvel" };

async function Conteudo() {
  const sessao = await exigirSessao();
  const { bairros, corretores } = await opcoesFormulario(sessao);
  return <FormImovel bairros={bairros} corretores={corretores} dono={sessao.dono} />;
}

export default function NovoImovel() {
  return (
    <Pagina>
      <Link href="/painel/imoveis" className="text-[14px] font-semibold text-suave underline-offset-4 hover:underline">
        ← Imóveis
      </Link>
      <h1 className="mb-6 mt-2 text-[clamp(26px,4vw,34px)]">Novo imóvel</h1>
      <Suspense fallback={<Carregando />}>
        <Conteudo />
      </Suspense>
    </Pagina>
  );
}
