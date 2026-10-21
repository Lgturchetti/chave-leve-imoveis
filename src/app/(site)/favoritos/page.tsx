import type { Metadata } from "next";
import { ListaFavoritos } from "@/components/lista-favoritos";
import { listarImoveis } from "@/data/imoveis";

export const metadata: Metadata = { title: "Favoritos" };

export default async function Favoritos() {
  const imoveis = await listarImoveis();
  return (
    <div className="mx-auto max-w-[1240px] px-margem pb-24 pt-8">
      <h1 className="text-[clamp(30px,4.4vw,48px)]">Favoritos</h1>
      <p className="mt-2 text-suave">Salvos neste aparelho. Em outro celular ou computador, a lista começa vazia.</p>
      <ListaFavoritos imoveis={imoveis} />
    </div>
  );
}
