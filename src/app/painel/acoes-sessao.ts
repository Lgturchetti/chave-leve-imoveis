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
  const { error } = await supabase.auth.updateUser({ password: nova });
  if (error) return { erro: error.code === "same_password" ? "A senha nova precisa ser diferente da atual." : "Não foi possível trocar a senha. Tente de novo." };
  await supabase.rpc("senha_trocada");
  redirect("/painel?senha=ok");
}
