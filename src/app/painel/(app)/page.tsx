import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Carregando, Pagina } from "@/components/painel/carregando";
import { exigirSessao, formatarDia } from "@/lib/painel";

export const metadata: Metadata = { title: "Início" };

const turnos = { manha: "manhã", tarde: "tarde" } as const;

async function Conteudo() {
  const { supabase, perfil, dono } = await exigirSessao();
  const contar = (q: PromiseLike<{ count: number | null }>) => Promise.resolve(q).then((r) => r.count ?? 0);
  const [novas, confirmadas, noSite, rascunhos, contatos, proximas] = await Promise.all([
    contar(supabase.from("visitas").select("id", { count: "exact", head: true }).eq("status", "novo")),
    contar(supabase.from("visitas").select("id", { count: "exact", head: true }).eq("status", "em_andamento")),
    contar(supabase.from("imoveis").select("id", { count: "exact", head: true }).in("status", ["disponivel", "reservado"])),
    contar(supabase.from("imoveis").select("id", { count: "exact", head: true }).eq("status", "rascunho")),
    dono ? contar(supabase.from("proprietarios").select("id", { count: "exact", head: true }).eq("status", "novo")) : Promise.resolve(0),
    supabase.from("visitas").select("id, nome, dia, turno, status, imovel:imoveis(codigo, titulo)").in("status", ["novo", "em_andamento"]).order("dia").order("turno").limit(5),
  ]);
  type Proxima = { id: string; nome: string; dia: string; turno: "manha" | "tarde"; status: string; imovel: { codigo: string; titulo: string } | null };
  const lista = (proximas.data ?? []) as unknown as Proxima[];

  const cartoes = [
    { href: "/painel/visitas", n: novas, nome: novas === 1 ? "visita para confirmar" : "visitas para confirmar", destaque: novas > 0 },
    { href: "/painel/visitas", n: confirmadas, nome: confirmadas === 1 ? "visita confirmada" : "visitas confirmadas" },
    ...(dono ? [{ href: "/painel/proprietarios", n: contatos, nome: contatos === 1 ? "proprietário novo" : "proprietários novos", destaque: contatos > 0 }] : []),
    { href: "/painel/imoveis", n: noSite, nome: noSite === 1 ? "imóvel no site" : "imóveis no site" },
    { href: "/painel/imoveis", n: rascunhos, nome: rascunhos === 1 ? "rascunho" : "rascunhos" },
  ];

  return (
    <>
      <h1 className="text-[clamp(26px,4vw,34px)]">Olá, {perfil.nome.split(" ")[0]}</h1>
      <p className="mt-1 text-suave">{dono ? "Resumo da imobiliária." : "Resumo dos seus imóveis."}</p>

      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 [&>li:last-child:nth-child(odd)]:col-span-2 md:[&>li:last-child:nth-child(odd)]:col-span-1">
        {cartoes.map((c) => (
          <li key={c.nome}>
            <Link
              href={c.href}
              className={`block h-full rounded-cartao p-4 shadow-suave transition-transform duration-150 active:scale-[0.98] ${c.destaque ? "bg-acao text-white" : "bg-superficie"}`}
            >
              <span className="block font-titulo text-[32px] font-semibold leading-none tracking-[-0.04em] tabular-nums">{c.n}</span>
              <span className={`mt-2 block text-[14px] font-semibold ${c.destaque ? "text-white/85" : "text-suave"}`}>{c.nome}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-10" aria-labelledby="proximas">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="proximas" className="text-[22px]">
            Próximas visitas
          </h2>
          <Link href="/painel/visitas" className="text-[14px] font-semibold text-acao underline-offset-4 hover:underline">
            Ver todas
          </Link>
        </div>
        {lista.length === 0 ? (
          <p className="mt-3 text-suave">Nenhuma visita marcada.</p>
        ) : (
          <ul className="mt-3 divide-y divide-linha rounded-cartao bg-superficie shadow-suave">
            {lista.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-semibold first-letter:uppercase">
                    {formatarDia(v.dia)}, {turnos[v.turno]}
                  </p>
                  <p className="truncate text-[14px] text-suave">
                    {v.nome} · {v.imovel?.codigo} {v.imovel?.titulo}
                  </p>
                </div>
                {v.status === "novo" && <span className="shrink-0 rounded-full bg-acao px-2.5 py-1 text-[12px] font-semibold text-white">Confirmar</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function Inicio() {
  return (
    <Pagina>
      <Suspense fallback={<Carregando linhas={3} />}>
        <Conteudo />
      </Suspense>
    </Pagina>
  );
}
