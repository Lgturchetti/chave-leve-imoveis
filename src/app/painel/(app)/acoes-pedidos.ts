"use server";

// Mudar a situação de um pedido de visita ou contato de proprietário (RLS confere quem pode)
import { exigirSessao } from "@/lib/painel";
import { refresh } from "next/cache";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const STATUS = ["novo", "em_andamento", "concluido", "cancelado"];

export async function mudarStatus(tabela: "visitas" | "proprietarios", id: string, status: string): Promise<{ erro?: string }> {
  const { supabase, dono } = await exigirSessao();
  if (tabela !== "visitas" && tabela !== "proprietarios") return { erro: "Pedido inválido." };
  if (tabela === "proprietarios" && !dono) return { erro: "Só o dono vê os contatos de proprietários." };
  if (!UUID.test(id) || !STATUS.includes(status)) return { erro: "Pedido inválido." };
  const { data, error } = await supabase.from(tabela).update({ status }).eq("id", id).select("id");
  if (error || !data?.length) return { erro: "Não foi possível atualizar. Atualize a página e tente de novo." };
  refresh();
  return {};
}
