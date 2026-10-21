import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Só no painel: renova o login (cookies) e manda quem não entrou para a tela de entrar.
// A proteção de verdade está no banco (RLS) e em cada ação do servidor; isto é conforto.
export async function proxy(request: NextRequest) {
  let resposta = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => resposta.headers.set(k, v as string));
      },
    },
  });

  // Não colocar nada entre createServerClient e getClaims (orientação do Supabase)
  const { data } = await supabase.auth.getClaims();
  const logado = Boolean(data?.claims?.sub);
  const naEntrada = request.nextUrl.pathname === "/painel/entrar";

  if (!logado && !naEntrada) {
    const url = request.nextUrl.clone();
    url.pathname = "/painel/entrar";
    url.search = "";
    const r = NextResponse.redirect(url);
    resposta.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  }
  return resposta;
}

export const config = { matcher: ["/painel", "/painel/:path*"] };
