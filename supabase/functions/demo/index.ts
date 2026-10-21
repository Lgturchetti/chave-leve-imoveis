// Função "demo": deixa qualquer visitante do portfólio entrar no painel como "Visitante".
// Não usa senha: gera um link de acesso de uso único (sem mandar e-mail) e devolve só o código dele;
// o site troca esse código pela sessão. Assim ninguém consegue trancar a conta trocando a senha.
// verify_jwt desligado de propósito: a demonstração é pública. O que o visitante pode fazer
// é decidido pelas regras do banco (migração 0004_demo.sql).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const secreta = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(URL_, secreta, { auth: { persistSession: false, autoRefreshToken: false } });

const EMAIL = "visitante@example.com";

const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });

// Garante que existe o login e o perfil "demo" (cria na primeira vez)
async function garantirVisitante(): Promise<boolean> {
  const { data: perfil } = await admin.from("perfis").select("id, user_id").eq("papel", "demo").maybeSingle();
  if (perfil?.user_id) return true;

  const senha = crypto.randomUUID() + crypto.randomUUID(); // ninguém usa; só porque a conta precisa de uma
  let { data: criado, error } = await admin.auth.admin.createUser({ email: EMAIL, password: senha, email_confirm: true });
  if (error && /already|registered|exists/i.test(error.message)) {
    // Login já existe (perfil apagado à mão): reaproveita
    const { data: lista } = await admin.auth.admin.listUsers({ perPage: 200 });
    const user = lista?.users.find((u) => u.email === EMAIL);
    if (user) ({ data: criado, error } = { data: { user }, error: null });
  }
  if (error || !criado?.user) return false;

  const r = perfil
    ? await admin.from("perfis").update({ user_id: criado.user.id }).eq("id", perfil.id)
    : await admin.from("perfis").insert({ user_id: criado.user.id, nome: "Visitante", papel: "demo", whatsapp: "5555900000099" });
  return !r.error;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ erro: "Método não permitido." }, 405);

  if (!(await garantirVisitante())) return json({ erro: "Demonstração indisponível agora." }, 500);

  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: EMAIL });
  const hash = data?.properties?.hashed_token;
  if (error || !hash) return json({ erro: "Demonstração indisponível agora." }, 500);
  return json({ token_hash: hash });
});
