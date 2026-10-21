import type { Metadata } from "next";
import { Suspense } from "react";
import { AbasFiltro } from "@/components/painel/abas-filtro";
import { AcoesPedido } from "@/components/painel/acoes-pedido";
import { Carregando, Pagina } from "@/components/painel/carregando";
import { SeloStatus } from "@/components/painel/selo-status";
import { exigirDono, formatarQuando, linkZap, statusProprietario, telefone, type StatusPedido } from "@/lib/painel";

export const metadata: Metadata = { title: "Proprietários" };

const abas = [
  { id: "abertos", nome: "Para responder", status: ["novo", "em_andamento"] },
  { id: "fechados", nome: "Fechados", status: ["concluido"] },
  { id: "descartados", nome: "Descartados", status: ["cancelado"] },
];

type Contato = { id: string; nome: string; whatsapp: string; bairro: string; mensagem: string | null; status: StatusPedido; criado_em: string };

async function Conteudo({ searchParams }: PageProps<"/painel/proprietarios">) {
  const { situacao } = await searchParams;
  const aba = abas.find((a) => a.id === situacao) ?? abas[0];
  const { supabase, perfil } = await exigirDono({ permitirDemo: true });
  const { data } = await supabase.from("proprietarios").select("id, nome, whatsapp, bairro, mensagem, status, criado_em").in("status", aba.status).order("criado_em", { ascending: false }).limit(100);
  const contatos = (data ?? []) as Contato[];

  return (
    <>
      <AbasFiltro base="/painel/proprietarios" atual={aba.id} abas={abas} />
      {contatos.length === 0 ? (
        <p className="mt-8 text-suave">{aba.id === "abertos" ? "Nenhum contato novo. Quem preencher “Anuncie seu imóvel” no site aparece aqui." : "Nada por aqui."}</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {contatos.map((c) => {
            const botoes =
              c.status === "novo"
                ? [{ status: "em_andamento", nome: "Já respondi", principal: true }, { status: "cancelado", nome: "Descartar" }]
                : c.status === "em_andamento"
                  ? [{ status: "concluido", nome: "Fechou negócio", principal: true }, { status: "cancelado", nome: "Descartar" }]
                  : [{ status: "novo", nome: "Reabrir" }];
            const msg = `Olá, ${c.nome.split(" ")[0]}! Aqui é ${perfil.nome.split(" ")[0]}, da Chave Leve. Recebemos seu contato sobre o imóvel no bairro ${c.bairro}. `;
            return (
              <li key={c.id} className="rounded-cartao bg-superficie p-5 shadow-suave">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-titulo text-[19px] font-semibold tracking-[-0.03em] [overflow-wrap:anywhere]">{c.nome}</p>
                    <p className="mt-1 text-[15px] text-suave">
                      <span className="tabular-nums">{telefone(c.whatsapp)}</span> · imóvel no {c.bairro}
                    </p>
                  </div>
                  <SeloStatus status={c.status} rotulo={statusProprietario[c.status]} />
                </div>
                {c.mensagem && <p className="mt-3 whitespace-pre-line rounded-2xl bg-fundo p-3 text-[15px] [overflow-wrap:anywhere]">{c.mensagem}</p>}
                <p className="mt-2 text-[13px] text-suave">Recebido em {formatarQuando(c.criado_em)}</p>
                <AcoesPedido tabela="proprietarios" id={c.id} botoes={botoes} whatsapp={linkZap(c.whatsapp, msg)} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function Proprietarios(props: PageProps<"/painel/proprietarios">) {
  return (
    <Pagina>
      <h1 className="text-[clamp(26px,4vw,34px)]">Proprietários</h1>
      <p className="mt-1 text-suave">Quem quer anunciar o imóvel com a Chave Leve (formulário do site).</p>
      <Suspense fallback={<div className="mt-6"><Carregando /></div>}>
        <Conteudo {...props} />
      </Suspense>
    </Pagina>
  );
}
