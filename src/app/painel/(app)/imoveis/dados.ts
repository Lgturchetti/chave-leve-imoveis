import "server-only";
import type { Sessao } from "@/lib/painel";

// Listas para o formulário: bairros já usados e (para o dono) corretores ativos
export async function opcoesFormulario({ supabase, dono, perfil }: Sessao) {
  const [{ data: bairros }, { data: equipe }] = await Promise.all([
    supabase.from("imoveis").select("bairro"),
    dono ? supabase.from("perfis").select("id, nome").eq("ativo", true).in("papel", ["dono", "corretor"]).order("nome") : Promise.resolve({ data: [{ id: perfil.id, nome: perfil.nome }] }),
  ]);
  return {
    bairros: [...new Set((bairros ?? []).map((b) => b.bairro as string))],
    corretores: (equipe ?? []) as { id: string; nome: string }[],
  };
}
