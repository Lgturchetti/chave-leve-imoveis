import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AbasFiltro } from "@/components/painel/abas-filtro";
import { AcoesPedido } from "@/components/painel/acoes-pedido";
import { Carregando, Pagina } from "@/components/painel/carregando";
import { SeloStatus } from "@/components/painel/selo-status";
import { exigirSessao, formatarDia, formatarQuando, linkZap, statusVisita, telefone, type StatusPedido } from "@/lib/painel";

export const metadata: Metadata = { title: "Visitas" };

const abas = [
  { id: "abertas", nome: "Para fazer", status: ["novo", "em_andamento"] },
  { id: "feitas", nome: "Feitas", status: ["concluido"] },
  { id: "canceladas", nome: "Canceladas", status: ["cancelado"] },
];
const turnos = { manha: "manhã", tarde: "tarde" } as const;

type Visita = {
  id: string; nome: string; whatsapp: string; dia: string; turno: "manha" | "tarde"; status: StatusPedido; criado_em: string;
  imovel: { codigo: string; titulo: string; bairro: string; corretor: { nome: string } | null } | null;
};

async function Conteudo({ searchParams }: PageProps<"/painel/visitas">) {
  const { situacao } = await searchParams;
  const aba = abas.find((a) => a.id === situacao) ?? abas[0];
  const { supabase, perfil, dono } = await exigirSessao();
  const { data } = await supabase
    .from("visitas")
    .select("id, nome, whatsapp, dia, turno, status, criado_em, imovel:imoveis(codigo, titulo, bairro, corretor:perfis(nome))")
    .in("status", aba.status)
    .order("dia", { ascending: aba.id === "abertas" })
    .order("turno")
    .limit(100);
  const visitas = (data ?? []) as unknown as Visita[];
  const { count: abertas } = await supabase.from("visitas").select("id", { count: "exact", head: true }).in("status", ["novo", "em_andamento"]);

  return (
    <>
      <AbasFiltro base="/painel/visitas" atual={aba.id} abas={abas.map((a) => ({ id: a.id, nome: a.nome, qtd: a.id === "abertas" ? (abertas ?? 0) : undefined }))} />
      {visitas.length === 0 ? (
        <p className="mt-8 text-suave">{aba.id === "abertas" ? "Nenhuma visita para fazer. Quando alguém pedir pelo site, aparece aqui." : "Nada por aqui."}</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {visitas.map((v) => {
            const quando = `${formatarDia(v.dia)}, de ${turnos[v.turno]}`;
            const msg = `Olá, ${v.nome.split(" ")[0]}! Aqui é ${perfil.nome.split(" ")[0]}, da Chave Leve. Sobre a visita ao imóvel ${v.imovel?.codigo ?? ""} (${v.imovel?.titulo ?? ""}), ${quando}: `;
            const botoes =
              v.status === "novo"
                ? [{ status: "em_andamento", nome: "Confirmar", principal: true }, { status: "cancelado", nome: "Cancelar" }]
                : v.status === "em_andamento"
                  ? [{ status: "concluido", nome: "Marcar como feita", principal: true }, { status: "cancelado", nome: "Cancelar" }]
                  : [{ status: "novo", nome: "Reabrir" }];
            return (
              <li key={v.id} className="rounded-cartao bg-superficie p-5 shadow-suave">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-titulo text-[19px] font-semibold first-letter:uppercase tracking-[-0.03em]">{quando}</p>
                    <p className="mt-1 [overflow-wrap:anywhere]">
                      <span className="font-semibold">{v.nome}</span> · <span className="tabular-nums">{telefone(v.whatsapp)}</span>
                    </p>
                  </div>
                  <SeloStatus status={v.status} rotulo={statusVisita[v.status]} />
                </div>
                {v.imovel && (
                  <p className="mt-2 text-[15px] text-suave [overflow-wrap:anywhere]">
                    <Link href={`/painel/imoveis/${v.imovel.codigo}`} className="font-semibold text-tinta underline-offset-4 hover:underline">
                      {v.imovel.codigo}
                    </Link>{" "}
                    {v.imovel.titulo} · {v.imovel.bairro}
                    {dono && v.imovel.corretor ? ` · ${v.imovel.corretor.nome}` : ""}
                  </p>
                )}
                <p className="mt-1 text-[13px] text-suave">Pedido em {formatarQuando(v.criado_em)}</p>
                <AcoesPedido tabela="visitas" id={v.id} botoes={botoes} whatsapp={linkZap(v.whatsapp, msg)} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function Visitas(props: PageProps<"/painel/visitas">) {
  return (
    <Pagina>
      <h1 className="text-[clamp(26px,4vw,34px)]">Visitas</h1>
      <p className="mt-1 text-suave">Confirme pelo WhatsApp em até 2 horas (é o que o site promete).</p>
      <Suspense fallback={<div className="mt-6"><Carregando /></div>}>
        <Conteudo {...props} />
      </Suspense>
    </Pagina>
  );
}
