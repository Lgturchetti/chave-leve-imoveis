import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Carregando, Pagina } from "@/components/painel/carregando";
import { exigirSessao } from "@/lib/painel";
import { sair } from "../../acoes-sessao";

export const metadata: Metadata = { title: "Conta" };

async function Conteudo() {
  const { perfil, dono, demo } = await exigirSessao();
  const links = [
    ...(dono ? [{ href: "/painel/proprietarios", nome: "Proprietários", desc: "Quem quer anunciar com a imobiliária" }] : []),
    ...(dono && !demo ? [{ href: "/painel/equipe", nome: "Equipe", desc: "Corretores, logins e senhas" }] : []),
    ...(!demo ? [{ href: "/painel/senha", nome: "Trocar minha senha", desc: "" }] : []),
    { href: "/", nome: "Ver o site", desc: "Como os clientes veem" },
  ];
  return (
    <>
      <h1 className="text-[clamp(26px,4vw,34px)] [overflow-wrap:anywhere]">{perfil.nome}</h1>
      <p className="mt-1 text-suave">{demo ? "Demonstração: você vê o painel como o dono da imobiliária (menos equipe e senhas)" : dono ? "Dono da imobiliária" : "Corretor"}</p>
      <ul className="mt-6 divide-y divide-linha rounded-cartao bg-superficie shadow-suave">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-fundo/60">
              <span>
                <span className="block font-semibold">{l.nome}</span>
                {l.desc && <span className="block text-[14px] text-suave">{l.desc}</span>}
              </span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-suave"><path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </li>
        ))}
      </ul>
      <form action={sair} className="mt-6">
        <button type="submit" className="botao botao-contorno w-full sm:w-auto">
          Sair
        </button>
      </form>
    </>
  );
}

export default function Conta() {
  return (
    <Pagina>
      <Suspense fallback={<Carregando linhas={3} />}>
        <Conteudo />
      </Suspense>
    </Pagina>
  );
}
