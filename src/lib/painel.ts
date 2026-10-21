import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { supabaseServidor } from "@/lib/supabase/servidor";

export type Perfil = {
  id: string;
  user_id: string;
  nome: string;
  papel: "dono" | "corretor" | "demo";
  creci: string | null;
  whatsapp: string;
  ativo: boolean;
  trocar_senha: boolean;
};

export type Sessao = { supabase: Awaited<ReturnType<typeof supabaseServidor>>; perfil: Perfil; dono: boolean };

// Confere o login (token verificado) e busca o perfil. Usar em TODA página e ação do painel.
// Sem login → tela de entrar. Sem perfil ativo → aviso. Senha provisória → obriga a trocar.
export async function exigirSessao(opcoes: { trocandoSenha?: boolean } = {}): Promise<Sessao> {
  await connection(); // sempre na hora do pedido (o login confere o relógio para ver se a sessão expirou)
  const supabase = await supabaseServidor();
  const { data } = await supabase.auth.getClaims();
  const uid = data?.claims?.sub;
  if (!uid) redirect("/painel/entrar");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("id, user_id, nome, papel, creci, whatsapp, ativo, trocar_senha")
    .eq("user_id", uid)
    .maybeSingle<Perfil>();
  if (!perfil || !perfil.ativo || perfil.papel === "demo") redirect("/painel/entrar?aviso=sem-acesso");
  if (perfil.trocar_senha && !opcoes.trocandoSenha) redirect("/painel/senha");

  return { supabase, perfil, dono: perfil.papel === "dono" };
}

export async function exigirDono(): Promise<Sessao> {
  const s = await exigirSessao();
  if (!s.dono) redirect("/painel");
  return s;
}

// Rótulos
export const statusImovel = {
  rascunho: "Rascunho",
  disponivel: "Disponível",
  reservado: "Reservado",
  alugado: "Alugado",
} as const;

export const statusVisita = {
  novo: "Nova",
  em_andamento: "Confirmada",
  concluido: "Feita",
  cancelado: "Cancelada",
} as const;

export const statusProprietario = {
  novo: "Novo",
  em_andamento: "Em conversa",
  concluido: "Fechado",
  cancelado: "Descartado",
} as const;

export type StatusPedido = keyof typeof statusVisita;

const diaSemana = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
export const formatarDia = (iso: string) => diaSemana.format(new Date(`${iso}T12:00:00Z`)).replace(/\./g, "");

const quando = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
export const formatarQuando = (iso: string) => quando.format(new Date(iso)).replace(/\./g, "");

export const telefone = (d: string) => {
  const n = d.replace(/^55(?=\d{10,11}$)/, "");
  return n.length === 11 ? `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}` : n.length === 10 ? `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}` : d;
};

export const linkZap = (numero: string, texto: string) => {
  const n = numero.replace(/\D/g, "");
  // Até 11 dígitos = DDD + número (sem o 55 do Brasil); 12–13 já vêm com o 55
  return `https://wa.me/${n.length <= 11 ? `55${n}` : n}?text=${encodeURIComponent(texto)}`;
};
