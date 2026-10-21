import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AgendarVisita } from "@/components/agendar-visita";
import { BotaoFavorito } from "@/components/botao-favorito";
import { CartaoImovel } from "@/components/cartao-imovel";
import { Galeria } from "@/components/galeria";
import { MapaRegiao } from "@/components/mapa-regiao";
import { buscarImovel, listarImoveis } from "@/data/imoveis";
import { brl, distanciaUfsm, plural } from "@/data/formatar";
import { linkWhatsApp } from "@/data/site";

export async function generateStaticParams() {
  const lista = await listarImoveis();
  // Com Cache Components a lista não pode ser vazia (lição da clínica)
  return lista.length ? lista.map((m) => ({ codigo: m.codigo })) : [{ codigo: "_" }];
}

export async function generateMetadata({ params }: PageProps<"/imovel/[codigo]">): Promise<Metadata> {
  const m = await buscarImovel((await params).codigo);
  if (!m) return {};
  return {
    title: `${m.titulo}, ${m.bairro}`,
    description: `${m.titulo} em ${m.bairro}, Santa Maria. R$ ${brl(m.total)} por mês com condomínio e IPTU. ${distanciaUfsm(m)}.`,
    openGraph: { images: [m.fotos[0]?.url].filter(Boolean) as string[] },
  };
}

// O código do endereço é lido dentro do Suspense: a navegação mostra o esqueleto na hora
// (Next 16, "instant navigation") e o anúncio entra assim que os dados chegam.
export default function Pagina({ params }: PageProps<"/imovel/[codigo]">) {
  return <Suspense fallback={<Esqueleto />}>{params.then(({ codigo }) => <Anuncio codigo={codigo} />)}</Suspense>;
}

function Esqueleto() {
  return (
    <div className="mx-auto max-w-[1240px] px-margem pb-32 lg:pb-16" aria-busy="true" aria-label="Carregando o anúncio">
      <div className="py-3">
        <Link href="/" className="botao botao-contorno botao-pequeno">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          Imóveis
        </Link>
      </div>
      <div className="-mx-[max(1rem,env(safe-area-inset-left,0px))] aspect-[4/3] animate-pulse bg-[#e5e9f0] sm:mx-0 sm:aspect-[2/1] sm:rounded-cartao" />
      <div className="mt-6 grid gap-3 lg:w-[60%]">
        <div className="h-9 w-4/5 animate-pulse rounded-xl bg-[#e5e9f0]" />
        <div className="h-5 w-1/2 animate-pulse rounded-lg bg-[#e5e9f0]" />
      </div>
    </div>
  );
}

async function Anuncio({ codigo }: { codigo: string }) {
  const m = await buscarImovel(codigo);
  if (!m) notFound();

  const todos = await listarImoveis();
  const parecidos = todos
    .filter((x) => x.codigo !== m.codigo && (x.bairro === m.bairro || Math.abs(x.total - m.total) < 400))
    .slice(0, 4);
  const whatsapp = linkWhatsApp(`Olá! Tenho interesse no imóvel ${m.codigo} (${m.titulo}), que vi no site da Chave Leve.`);
  const caracteristicas = [
    plural(m.quartos, "quarto", "quartos"),
    plural(m.banheiros, "banheiro", "banheiros"),
    `${m.area} m²`,
    m.vagas ? plural(m.vagas, "vaga", "vagas") : "Sem vaga",
    m.mobiliado ? "Mobiliado" : "Sem móveis",
    m.aceitaPet ? "Aceita pet" : null,
    m.paraDividir ? "Bom para dividir" : null,
  ].filter(Boolean) as string[];

  return (
    <div className="pb-32 lg:pb-16">
      <div className="mx-auto max-w-[1240px] px-margem">
        <div className="flex items-center justify-between py-3">
          <Link href="/" className="botao botao-contorno botao-pequeno">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
            Imóveis
          </Link>
          <BotaoFavorito codigo={m.codigo} titulo={m.titulo} solido />
        </div>

        <Galeria fotos={m.fotos} titulo={m.titulo} />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          <div>
            {m.status === "reservado" && (
              <p className="mb-3 inline-block rounded-full bg-tinta px-3 py-1 text-[13px] font-semibold text-white">Reservado: ainda dá para entrar na lista de espera</p>
            )}
            <h1 className="text-[clamp(28px,3.6vw,40px)]">{m.titulo}</h1>
            <p className="mt-2 text-suave">
              {m.bairro}, Santa Maria · código {m.codigo} · {distanciaUfsm(m)}
            </p>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Características">
              {caracteristicas.map((c) => (
                <li key={c} className="rounded-full border border-linha bg-superficie px-3.5 py-1.5 text-[14px]">
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-[62ch]">{m.descricao}</p>

            <div className="mt-8 rounded-cartao bg-superficie p-5 shadow-suave">
              <h2 className="text-[20px]">Onde fica</h2>
              <p className="mt-1 text-[14px] text-suave">Região aproximada. O endereço exato é passado na visita.</p>
              <MapaRegiao lat={m.regiao.lat} lon={m.regiao.lon} />
            </div>

            <div className="mt-6 flex items-center gap-4 rounded-cartao bg-superficie p-5 shadow-suave">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-limao font-titulo text-[18px] font-semibold" aria-hidden="true">
                {m.corretor.nome.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{m.corretor.nome}</p>
                <p className="text-[14px] text-suave">Corretor responsável · {m.corretor.creci}</p>
              </div>
            </div>
          </div>

          {/* Cartão de custo: fixo ao rolar no desktop; no celular vira a barra fixa embaixo */}
          <aside className="rounded-cartao bg-superficie p-6 shadow-suave lg:sticky lg:top-[calc(var(--altura-cabecalho)+1rem)]" aria-label="Custo e agendamento">
            <p className="text-[14px] text-suave">Total por mês</p>
            <p className="font-titulo text-[32px] font-semibold tracking-[-0.03em]">R$ {brl(m.total)}</p>
            <dl className="mt-4 border-t border-linha text-[15px]">
              {[
                ["Aluguel", `R$ ${brl(m.aluguel)}`],
                ["Condomínio", m.condominio ? `R$ ${brl(m.condominio)}` : "Não tem"],
                ["IPTU (por mês)", `R$ ${brl(m.iptu)}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-linha py-2.5">
                  <dt>{k}</dt>
                  <dd className="tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 hidden space-y-2 lg:block">
              <AgendarVisita codigo={m.codigo} titulo={m.titulo} className="w-full" />
              <a href={whatsapp} className="botao botao-contorno w-full">
                Conversar no WhatsApp
              </a>
              <p className="pt-1 text-center text-[13px] text-suave">O corretor confirma pelo WhatsApp em até 2 horas.</p>
            </div>
          </aside>
        </div>

        {parecidos.length > 0 && (
          <section className="mt-16" aria-labelledby="parecidos">
            <h2 id="parecidos" className="text-[24px]">
              Parecidos
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-7 min-[560px]:grid-cols-2 lg:grid-cols-4">
              {parecidos.map((p) => (
                <CartaoImovel key={p.codigo} m={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Celular: barra fixa com o total e "Agendar visita" */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-linha bg-superficie px-margem pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 lg:hidden">
        <div>
          <p className="font-titulo text-[19px] font-semibold tracking-[-0.03em]">R$ {brl(m.total)}</p>
          <p className="text-[13px] text-suave">por mês, tudo incluído</p>
        </div>
        <AgendarVisita codigo={m.codigo} titulo={m.titulo} />
      </div>
    </div>
  );
}
