import { Accordion } from "@base-ui/react/accordion";
import type { Metadata } from "next";
import Link from "next/link";
import { linkWhatsApp } from "@/data/site";

export const metadata: Metadata = {
  title: "Como funciona",
  description: "Como alugar com a Chave Leve sem precisar ir até a imobiliária: visita agendada pelo site, documentos pelo celular e contrato digital.",
};

const passos = [
  { titulo: "Escolha pelo site", texto: "Fotos de verdade, tiradas pela gente, e o custo total do mês (aluguel, condomínio e IPTU) já somado." },
  { titulo: "Agende a visita", texto: "Escolha o dia e o turno. O corretor confirma pelo WhatsApp em até 2 horas e encontra você no imóvel." },
  { titulo: "Mande os documentos pelo celular", texto: "Foto do documento, comprovante de renda e a garantia escolhida. Tudo pelo WhatsApp ou e-mail." },
  { titulo: "Assine o contrato digital", texto: "Pelo celular, com validade jurídica. Você só precisa vir buscar a chave, ou a gente leva até você." },
];

const garantias = [
  { nome: "Fiador", texto: "Alguém com imóvel quitado em Santa Maria assina junto. Não tem custo extra." },
  { nome: "Seguro-fiança", texto: "Uma seguradora garante o aluguel. Custa em média um aluguel por ano, dividido nas mensalidades. Bom para quem é de fora." },
  { nome: "Caução", texto: "Até três aluguéis depositados numa poupança, devolvidos no fim do contrato com o rendimento." },
];

const duvidas = [
  { p: "Sou de outra cidade. Dá para alugar sem visitar?", r: "Dá. Fazemos a visita por chamada de vídeo e você assina tudo pelo celular. Muitos pais de calouros alugam assim." },
  { p: "Posso dividir o aluguel com colegas?", r: "Pode. O contrato fica no nome de um ou de todos, como preferirem. Imóveis bons para dividir têm a etiqueta \"Para dividir\"." },
  { p: "O contrato é de quanto tempo?", r: "Em geral 12 meses. Para estudantes, também temos contratos que acompanham o semestre." },
  { p: "O valor do site é o valor final?", r: "Sim. O total mostrado já soma aluguel, condomínio e IPTU. Luz, água e internet ficam por sua conta, em seu nome." },
];

export default function ComoFunciona() {
  return (
    <div className="mx-auto max-w-[1240px] px-margem pb-24 pt-8">
      <h1 className="max-w-[16ch] text-[clamp(32px,5vw,56px)]">Alugar sem precisar ir até a imobiliária.</h1>
      <p className="mt-4 max-w-[52ch] text-[18px] text-suave">Do primeiro clique à chave na mão, quase tudo pelo celular.</p>

      <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {passos.map((p, i) => (
          <li key={p.titulo} className="rounded-cartao bg-superficie p-6 shadow-suave">
            <span className="grid size-9 place-items-center rounded-full bg-limao font-titulo text-[15px] font-semibold tabular-nums" aria-hidden="true">
              {i + 1}
            </span>
            <h2 className="mt-4 text-[20px]">{p.titulo}</h2>
            <p className="mt-2 text-[15px] text-suave">{p.texto}</p>
          </li>
        ))}
      </ol>

      <section className="mt-16" aria-labelledby="garantias">
        <h2 id="garantias" className="text-[clamp(26px,3.4vw,36px)]">
          Garantias aceitas
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {garantias.map((g) => (
            <li key={g.nome} className="rounded-cartao border border-linha bg-superficie p-6">
              <h3 className="text-[19px]">{g.nome}</h3>
              <p className="mt-2 text-[15px] text-suave">{g.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 max-w-3xl" aria-labelledby="duvidas">
        <h2 id="duvidas" className="text-[clamp(26px,3.4vw,36px)]">
          Dúvidas
        </h2>
        <Accordion.Root className="mt-6 border-t border-linha">
          {duvidas.map((d) => (
            <Accordion.Item key={d.p} className="border-b border-linha">
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full cursor-pointer select-none items-center justify-between gap-6 py-5 text-left text-[17px] font-semibold transition-opacity duration-100 active:opacity-60">
                  {d.p}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-fundo transition-transform duration-200 ease-in-out group-data-panel-open:rotate-45 motion-reduce:transition-none" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" /></svg>
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="pb-5 pr-12 text-suave transition-[opacity,translate] duration-200 ease-out data-ending-style:opacity-0 data-starting-style:-translate-y-1 data-starting-style:opacity-0 motion-reduce:transition-none">
                {d.r}
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>

      <div className="mt-14 flex flex-wrap gap-3">
        <Link href="/" className="botao botao-acao">
          Ver imóveis
        </Link>
        <a href={linkWhatsApp("Olá! Tenho uma dúvida sobre como alugar com a Chave Leve.")} className="botao botao-contorno">
          Tirar dúvida no WhatsApp
        </a>
      </div>
    </div>
  );
}
