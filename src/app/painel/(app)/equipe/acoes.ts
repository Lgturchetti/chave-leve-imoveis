"use server";

// Equipe (só o dono). Criar login e gerar senha passam pela função "equipe" do Supabase,
// que tem a chave secreta e confere de novo se quem pede é o dono.
import { refresh } from "next/cache";
import { exigirDono } from "@/lib/painel";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export type ResultadoSenha = { erro?: string; email?: string; senha?: string; nome?: string };

async function chamar(corpo: Record<string, unknown>): Promise<ResultadoSenha> {
  const { supabase } = await exigirDono();
  const { data, error } = await supabase.functions.invoke("equipe", { body: corpo });
  if (error) {
    let msg = "Não foi possível concluir. Tente de novo.";
    try {
      const r = await (error as { context?: Response }).context?.json();
      if (r?.erro) msg = r.erro;
    } catch {}
    return { erro: msg };
  }
  refresh();
  return data as ResultadoSenha;
}

export async function criarPessoa(_a: ResultadoSenha, fd: FormData): Promise<ResultadoSenha> {
  const nome = String(fd.get("nome") ?? "").trim().slice(0, 80);
  const email = String(fd.get("email") ?? "").trim().toLowerCase().slice(0, 120);
  const whatsapp = String(fd.get("whatsapp") ?? "").replace(/\D/g, "").slice(0, 13);
  const creci = String(fd.get("creci") ?? "").trim().slice(0, 40);
  if (nome.length < 2) return { erro: "Escreva o nome." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erro: "E-mail inválido." };
  if (whatsapp.length < 10) return { erro: "Escreva o WhatsApp com DDD." };
  const r = await chamar({ acao: "criar", nome, email, whatsapp: whatsapp.length <= 11 ? `55${whatsapp}` : whatsapp, creci });
  return { ...r, nome };
}

export async function criarLogin(perfilId: string, nome: string, email: string): Promise<ResultadoSenha> {
  if (!UUID.test(perfilId)) return { erro: "Pessoa inválida." };
  const e = email.trim().toLowerCase().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { erro: "E-mail inválido." };
  return { ...(await chamar({ acao: "criar", perfil_id: perfilId, email: e })), nome };
}

export async function gerarSenha(perfilId: string, nome: string): Promise<ResultadoSenha> {
  if (!UUID.test(perfilId)) return { erro: "Pessoa inválida." };
  return { ...(await chamar({ acao: "redefinir", perfil_id: perfilId })), nome };
}

export async function mudarAtivo(perfilId: string, ativo: boolean): Promise<{ erro?: string }> {
  const { supabase, perfil } = await exigirDono();
  if (!UUID.test(perfilId)) return { erro: "Pessoa inválida." };
  if (perfilId === perfil.id) return { erro: "Você não pode se desativar." };
  const { data, error } = await supabase.from("perfis").update({ ativo }).eq("id", perfilId).select("id");
  if (error || !data?.length) return { erro: "Não foi possível atualizar." };
  refresh();
  return {};
}
