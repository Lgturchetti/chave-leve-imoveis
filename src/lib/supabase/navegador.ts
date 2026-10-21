import { createBrowserClient } from "@supabase/ssr";

// Cliente no navegador (com o login): usado só para enviar fotos direto ao armazenamento
export function supabaseNavegador() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}
