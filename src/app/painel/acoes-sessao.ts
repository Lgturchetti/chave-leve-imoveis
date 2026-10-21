"use server";

import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/servidor";

export type EstadoEntrar = { erro?: string; email?: string };

export async function entrar(_a: EstadoEntrar, fd: FormData): Promise<EstadoEntrar> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase().slice(0, 120);
  const senha = String(fd.get("senha") ?? "").slice(0, 200);
  if (!email || !senha) return { erro: "Preencha e-mail e senha.", email };

  const supabase = await supabaseServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) {
    // Mesma mensagem para e-mail ou senha errados (não entrega quais e-mails existem)
    const muitas = error.status === 429;
    return { erro: muitas ? "Muitas tentativas. Espere alguns minutos." : "E-mail ou senha incorretos.", email };
  }
  redirect("/painel");
}

// Demonstração do portfólio: a função "demo" do Supabase gera um código de acesso de uso único
// para a conta "Visitante" e aqui ele vira a sessão (cookies). Sem senha para alguém trocar.
export async function entrarDemo(): Promise<EstadoEntrar> {
  const supabase = await supabaseServidor();
  const { data, error } = await supabase.functions.invoke<{ token_hash?: string }>("demo", { method: "POST" });
  const hash = data?.token_hash;
  if (error || !hash) return { erro: "A demonstração não está disponível agora. Tente de novo em instantes." };
  const { error: erroSessao } = await supabase.auth.verifyOtp({ token_hash: hash, type: "email" });
  if (erroSessao) return { erro: erroSessao.status === 429 ? "Muitas entradas seguidas. Espere um minuto." : "A demonstração não está disponível agora. Tente de novo em instantes." };
  redirect("/painel?demo=1");
}

export async function sair() {
  const supabase = await supabaseServidor();
  await supabase.auth.signOut();
  redirect("/painel/entrar");
}

export type EstadoSenha = { erro?: string; ok?: boolean };

export async function trocarSenha(_a: EstadoSenha, fd: FormData): Promise<EstadoSenha> {
  const nova = String(fd.get("nova") ?? "");
  const repete = String(fd.get("repete") ?? "");
  if (nova.length < 10) return { erro: "Use pelo menos 10 caracteres." };
  if (nova.length > 72) return { erro: "Use no máximo 72 caracteres." };
  if (nova !== repete) return { erro: "As duas senhas não são iguais." };

  const supabase = await supabaseServidor();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/painel/entrar");
  const { data: perfil } = await supabase.from("perfis").select("papel").eq("user_id", data.claims.sub).maybeSingle();
  if (perfil?.papel === "demo") return { erro: "Na demonstração não dá para trocar a senha." };
  const { error } = await supabase.auth.updateUser({ password: nova });
  if (error) return { erro: error.code === "same_password" ? "A senha nova precisa ser diferente da atual." : "Não foi possível trocar a senha. Tente de novo." };
  await supabase.rpc("senha_trocada");
  redirect("/painel?senha=ok");
}
