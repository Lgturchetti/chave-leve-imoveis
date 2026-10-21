import type { Metadata } from "next";
import { FormularioProprietario } from "@/components/formulario-proprietario";

export const metadata: Metadata = {
  title: "Para proprietários",
  description: "Anuncie seu imóvel com a Chave Leve: fotos profissionais, inquilinos com documentação conferida e repasse em dia.",
};

const vantagens = [
  { titulo: "Fotos de verdade", texto: "A gente fotografa o imóvel. Anúncio bonito aluga mais rápido." },
  { titulo: "Inquilino conferido", texto: "Documentos, renda e garantia analisados antes da assinatura." },
  { titulo: "Repasse em dia", texto: "O aluguel cai na sua conta todo mês, com relatório pelo e-mail." },
  { titulo: "Sem dor de cabeça", texto: "Vistorias, reparos e renovações com a gente." },
];

export default function Proprietarios() {
  return (
    <div className="mx-auto grid max-w-[1240px] gap-12 px-margem pb-24 pt-8 lg:grid-cols-[1fr_1fr]">
      <div>
        <h1 className="max-w-[14ch] text-[clamp(32px,5vw,56px)]">Seu imóvel alugado sem você se preocupar.</h1>
        <p className="mt-4 max-w-[46ch] text-[18px] text-suave">Muitos dos nossos inquilinos são estudantes da UFSM e famílias de Santa Maria procurando pelo celular.</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {vantagens.map((v) => (
            <li key={v.titulo} className="rounded-cartao bg-superficie p-5 shadow-suave">
              <h2 className="text-[18px]">{v.titulo}</h2>
              <p className="mt-1.5 text-[15px] text-suave">{v.texto}</p>
            </li>
          ))}
        </ul>
      </div>
      <section aria-labelledby="anuncie" className="rounded-cartao bg-superficie p-6 shadow-suave sm:p-8 lg:self-start">
        <h2 id="anuncie" className="text-[26px]">
          Anuncie seu imóvel
        </h2>
        <p className="mt-1.5 text-[15px] text-suave">Respondemos em até 1 dia útil.</p>
        <FormularioProprietario />
      </section>
    </div>
  );
}
