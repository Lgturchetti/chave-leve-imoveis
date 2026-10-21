// Função "equipe": só o DONO usa. Cria conta de corretor com senha provisória e redefine senha.
// Roda dentro do Supabase: a chave secreta (que ignora as regras do banco) nunca sai daqui.
// verify_jwt desligado porque a própria função confere o token (getClaims) e o papel de dono.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const secreta = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(URL_, secreta, { auth: { persistSession: false, autoRefreshToken: false } });

const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });

// Senha provisória legível (sem 0/O, 1/l): 3 blocos de 4
function senhaProvisoria() {
  const alfabeto = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const s = [...bytes].map((b) => alfabeto[b % alfabeto.length]).join("");
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}`;
}

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ erro: "Método não permitido." }, 405);

  // 1) Quem está chamando? Confere o token do login e se é o dono ativo.
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ erro: "Faça login." }, 401);
  const { data: claims, error: erroToken } = await admin.auth.getClaims(token);
  const uid = claims?.claims?.sub;
  if (erroToken || !uid) return json({ erro: "Sessão inválida. Entre de novo." }, 401);

  const { data: eu } = await admin.from("perfis").select("id, papel, ativo").eq("user_id", uid).maybeSingle();
  if (!eu || !eu.ativo || eu.papel !== "dono") return json({ erro: "Só o dono pode mexer na equipe." }, 403);

  let corpo: Record<string, unknown>;
  try {
    corpo = await req.json();
  } catch {
    return json({ erro: "Pedido inválido." }, 400);
  }

  // 2) Criar conta (pessoa nova ou perfil que ainda não tem login)
  if (corpo.acao === "criar") {
    const email = texto(corpo.email, 120).toLowerCase();
    const nome = texto(corpo.nome, 80);
    const whatsapp = texto(corpo.whatsapp, 20).replace(/\D/g, "");
    const creci = texto(corpo.creci, 40) || null;
    const perfilId = texto(corpo.perfil_id, 36) || null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ erro: "E-mail inválido." }, 400);
    if (!perfilId && (nome.length < 2 || whatsapp.length < 10 || whatsapp.length > 13)) return json({ erro: "Confira nome e WhatsApp." }, 400);

    if (perfilId) {
      const { data: p } = await admin.from("perfis").select("id, user_id").eq("id", perfilId).maybeSingle();
      if (!p) return json({ erro: "Pessoa não encontrada." }, 404);
      if (p.user_id) return json({ erro: "Essa pessoa já tem login." }, 409);
    }

    const senha = senhaProvisoria();
    const { data: criado, error } = await admin.auth.admin.createUser({ email, password: senha, email_confirm: true });
    if (error || !criado.user) {
      const jaExiste = /already|registered|exists/i.test(error?.message ?? "");
      return json({ erro: jaExiste ? "Já existe uma conta com esse e-mail." : "Não foi possível criar a conta." }, jaExiste ? 409 : 500);
    }

    const r = perfilId
      ? await admin.from("perfis").update({ user_id: criado.user.id, trocar_senha: true }).eq("id", perfilId)
      : await admin.from("perfis").insert({ user_id: criado.user.id, nome, whatsapp, creci, papel: "corretor", trocar_senha: true });
    if (r.error) {
      await admin.auth.admin.deleteUser(criado.user.id); // desfaz para não deixar conta solta
      return json({ erro: "Não foi possível salvar a pessoa." }, 500);
    }
    return json({ ok: true, email, senha });
  }

  // 3) Redefinir senha de alguém da equipe (gera outra provisória)
  if (corpo.acao === "redefinir") {
    const perfilId = texto(corpo.perfil_id, 36);
    const { data: p } = await admin.from("perfis").select("id, user_id").eq("id", perfilId).maybeSingle();
    if (!p?.user_id) return json({ erro: "Essa pessoa ainda não tem login." }, 404);
    if (p.user_id === uid) return json({ erro: "Para a sua própria senha, use Trocar minha senha." }, 400);
    const senha = senhaProvisoria();
    const { error } = await admin.auth.admin.updateUserById(p.user_id, { password: senha });
    if (error) return json({ erro: "Não foi possível redefinir." }, 500);
    await admin.from("perfis").update({ trocar_senha: true }).eq("id", p.id);
    return json({ ok: true, senha });
  }

  return json({ erro: "Ação desconhecida." }, 400);
});
