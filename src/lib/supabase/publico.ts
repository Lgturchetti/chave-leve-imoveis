import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente público (papel "anon"), só no servidor: lê imóveis publicados e cria pedidos.
// A chave publicável não é segredo; quem protege os dados são as regras do banco (RLS).
// O painel (parte 3) terá outro cliente, com o login da equipe.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !chave) throw new Error("Faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (.env.local)");

export const supabasePublico = createClient(url, chave, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  // Sem cache de fetch do Next: o cache é só o "use cache" de listarImoveis (tag "imoveis"),
  // senão a resposta velha do banco volta mesmo depois de o painel avisar que mudou
  global: { fetch: (entrada, opcoes) => fetch(entrada, { ...opcoes, cache: "no-store" }) },
});

export const urlFoto = (caminho: string) => `${url}/storage/v1/object/public/fotos/${caminho}`;
