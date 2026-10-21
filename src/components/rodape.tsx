import Link from "next/link";
import { Marca } from "@/components/marca";
import { linkWhatsApp, site } from "@/data/site";

export function Rodape() {
  return (
    <footer className="mt-auto border-t border-linha bg-superficie pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-12">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-margem md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <Marca />
            <span className="font-titulo text-[20px] font-semibold tracking-[-0.03em]" translate="no">
              {site.nomeCurto}
            </span>
          </div>
          <p className="mt-3 max-w-sm text-[15px] text-suave">Aluguel em Santa Maria sem precisar ir até a imobiliária.</p>
        </div>
        <nav aria-label="Rodapé" className="text-[15px]">
          <p className="font-semibold">A imobiliária</p>
          <ul className="mt-2 space-y-1 text-suave">
            <li><Link href="/como-funciona" className="hover:text-tinta">Como funciona</Link></li>
            <li><Link href="/proprietarios" className="hover:text-tinta">Para proprietários</Link></li>
            <li><Link href="/favoritos" className="hover:text-tinta">Favoritos</Link></li>
            <li><Link href="/painel" className="hover:text-tinta">Área do corretor</Link></li>
          </ul>
        </nav>
        <div className="text-[15px]">
          <p className="font-semibold">Fale com a gente</p>
          <p className="mt-2 text-suave">{site.endereco}</p>
          <p className="text-suave">{site.horario}</p>
          <a href={linkWhatsApp("Olá! Vim pelo site da Chave Leve.")} className="mt-2 inline-block font-semibold text-acao underline-offset-4 hover:underline">
            WhatsApp
          </a>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-[1240px] flex-col gap-1 px-margem text-[13px] text-suave md:flex-row md:justify-between">
        <p>
          <span translate="no">{site.nome}</span>. {site.creci}.
        </p>
        <p>Imobiliária fictícia, projeto de demonstração. Fotos: Pexels.</p>
      </div>
    </footer>
  );
}
