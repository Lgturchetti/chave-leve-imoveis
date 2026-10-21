"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { BotaoFavorito } from "@/components/botao-favorito";
import { type ImovelCompleto } from "@/data/imoveis";
import { brl, distanciaUfsm, etiquetaPrincipal } from "@/data/formatar";

// Cartão: fotos deslizando dentro do cartão (rolagem nativa com encaixe), bolinhas, etiqueta e coração.
// O coração fica FORA do link (botão dentro de link não é válido).
export function CartaoImovel({ m, prioridade, aoPassar }: { m: ImovelCompleto; prioridade?: boolean; aoPassar?: (codigo: string | null) => void }) {
  const [foto, setFoto] = useState(0);
  const trilho = useRef<HTMLDivElement>(null);
  const etiqueta = m.status === "reservado" ? "Reservado" : etiquetaPrincipal(m);

  return (
    <article className="relative" onPointerEnter={() => aoPassar?.(m.codigo)} onPointerLeave={() => aoPassar?.(null)}>
      <Link href={`/imovel/${m.codigo}`} className="group block rounded-foto" data-cartao={m.codigo}>
        <div className="relative aspect-[20/19] overflow-hidden rounded-foto bg-[#e5e9f0]">
          <div
            ref={trilho}
            className="trilho"
            onScroll={(e) => setFoto(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          >
            {m.fotos.map((f, i) => (
              <div key={f.url + i} className="relative">
                {/* Só a 1ª foto carrega de cara; as outras quando a pessoa desliza */}
                <Image src={f.url} alt={i === 0 ? f.alt : ""} fill sizes="(min-width: 1240px) 300px, (min-width: 640px) 45vw, 92vw" preload={prioridade && i === 0} loading={i === 0 ? undefined : "lazy"} className="object-cover" />
              </div>
            ))}
          </div>
          {m.fotos.length > 1 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center gap-[5px]" aria-hidden="true">
              {m.fotos.map((f, i) => (
                <i key={f.url + i} className={`size-1.5 rounded-full transition-[background-color,scale] duration-150 ${i === foto ? "scale-125 bg-white" : "bg-white/60"}`} />
              ))}
            </div>
          )}
          {etiqueta && (
            <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[12px] font-semibold ${m.status === "reservado" ? "bg-tinta text-white" : "bg-limao text-tinta"}`}>{etiqueta}</span>
          )}
        </div>
        <div className="mt-2.5 text-[15px]">
          <p className="font-semibold">{m.titulo}</p>
          <p className="text-suave">
            {m.bairro} · {distanciaUfsm(m)}
          </p>
          <p className="mt-0.5">
            <b className="font-semibold">R$ {brl(m.aluguel)}</b> aluguel <span className="text-suave">· R$ {brl(m.total)} no total</span>
          </p>
        </div>
      </Link>
      <BotaoFavorito codigo={m.codigo} titulo={m.titulo} className="absolute right-2 top-2" />
    </article>
  );
}
