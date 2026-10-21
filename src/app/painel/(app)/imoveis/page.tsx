import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Carregando, Pagina } from "@/components/painel/carregando";
import { ListaImoveisPainel, type ImovelLista } from "@/components/painel/lista-imoveis";
import { urlFoto } from "@/lib/supabase/publico";
import { exigirSessao } from "@/lib/painel";

export const metadata: Metadata = { title: "Imóveis" };

async function Conteudo() {
  const { supabase, dono } = await exigirSessao();
  const { data } = await supabase
    .from("imoveis")
    .select("id, codigo, titulo, bairro, status, aluguel, condominio, iptu, atualizado_em, corretor:perfis(nome), fotos(caminho, ordem)")
    .order("atualizado_em", { ascending: false });

  type Linha = { id: string; codigo: string; titulo: string; bairro: string; status: ImovelLista["status"]; aluguel: number; condominio: number; iptu: number; atualizado_em: string; corretor: { nome: string } | null; fotos: { caminho: string; ordem: number }[] };
  const imoveis: ImovelLista[] = ((data ?? []) as unknown as Linha[]).map((l) => {
    const capa = [...l.fotos].sort((a, b) => a.ordem - b.ordem)[0];
    return {
      id: l.id, codigo: l.codigo, titulo: l.titulo, bairro: l.bairro, status: l.status,
      total: l.aluguel + l.condominio + l.iptu, atualizadoEm: l.atualizado_em,
      corretor: l.corretor?.nome ?? "", capa: capa ? urlFoto(capa.caminho) : null, qtdFotos: l.fotos.length,
    };
  });
  return <ListaImoveisPainel imoveis={imoveis} dono={dono} />;
}

export default function Imoveis() {
  return (
    <Pagina>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[clamp(26px,4vw,34px)]">Imóveis</h1>
        <Link href="/painel/imoveis/novo" className="botao botao-acao botao-pequeno">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          Novo imóvel
        </Link>
      </div>
      <Suspense fallback={<div className="mt-6"><Carregando /></div>}>
        <Conteudo />
      </Suspense>
    </Pagina>
  );
}
