import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando, Pagina } from "@/components/painel/carregando";
import { Equipe, type Pessoa } from "@/components/painel/equipe";
import { exigirDono } from "@/lib/painel";

export const metadata: Metadata = { title: "Equipe" };

async function Conteudo() {
  const { supabase, perfil } = await exigirDono();
  const { data } = await supabase.from("perfis").select("id, user_id, nome, papel, creci, whatsapp, ativo, trocar_senha").in("papel", ["dono", "corretor"]).order("ativo", { ascending: false }).order("nome");
  const pessoas: Pessoa[] = (data ?? []).map((p) => ({
    id: p.id, nome: p.nome, papel: p.papel, creci: p.creci, whatsapp: p.whatsapp, ativo: p.ativo,
    temLogin: Boolean(p.user_id), senhaProvisoria: p.trocar_senha, eu: p.id === perfil.id,
  }));
  return <Equipe pessoas={pessoas} nomeDono={perfil.nome} />;
}

export default function PaginaEquipe() {
  return (
    <Pagina>
      <h1 className="text-[clamp(26px,4vw,34px)]">Equipe</h1>
      <p className="mt-1 max-w-prose text-suave">Cada pessoa entra com o próprio e‑mail. A senha provisória aparece uma vez só: mande para a pessoa, que troca no primeiro acesso.</p>
      <Suspense fallback={<div className="mt-6"><Carregando linhas={3} /></div>}>
        <Conteudo />
      </Suspense>
    </Pagina>
  );
}
