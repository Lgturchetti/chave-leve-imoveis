import { Suspense } from "react";
import { Busca, BuscaTela } from "@/components/busca";
import { listarImoveis } from "@/data/imoveis";

// A busca é a página inicial (como no Airbnb). Os filtros moram no endereço e são lidos no navegador,
// então a página continua estática e rápida.
export default async function Inicio() {
  const imoveis = await listarImoveis();
  return (
    <Suspense fallback={<BuscaTela imoveis={imoveis} consulta="" />}>
      <Busca imoveis={imoveis} />
    </Suspense>
  );
}
