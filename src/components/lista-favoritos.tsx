"use client";

import Link from "next/link";
import { CartaoImovel } from "@/components/cartao-imovel";
import { useFavoritos } from "@/components/favoritos";
import type { ImovelCompleto } from "@/data/imoveis";

export function ListaFavoritos({ imoveis }: { imoveis: ImovelCompleto[] }) {
  const { lista } = useFavoritos();
  // Na ordem em que foram salvos (o mais recente primeiro); imóvel que saiu do ar some da lista
  const itens = lista.map((c) => imoveis.find((m) => m.codigo === c)).filter((m): m is ImovelCompleto => !!m);

  if (!itens.length) {
    return (
      <div className="mt-8 rounded-cartao bg-superficie p-10 text-center shadow-suave">
        <h2 className="text-[22px]">Nenhum favorito ainda.</h2>
        <p className="mt-2 text-suave">Toque no coração de um imóvel para guardar aqui e comparar depois.</p>
        <Link href="/" className="botao botao-acao mt-5">
          Ver imóveis
        </Link>
      </div>
    );
  }
  return (
    <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-7 min-[560px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {itens.map((m) => (
        <CartaoImovel key={m.codigo} m={m} />
      ))}
    </div>
  );
}
