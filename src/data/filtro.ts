import type { ImovelCompleto } from "@/data/imoveis";

// Filtro da busca: mora no endereço (?categoria=…&bairro=…&ate=…&quartos=…&ordem=…)
export type Filtro = { categoria: string; bairro: string; ate: number; quartos: number; ordem: string };

export function lerFiltro(p: URLSearchParams): Filtro {
  return {
    categoria: p.get("categoria") ?? "todos",
    bairro: p.get("bairro") ?? "",
    ate: Number(p.get("ate")) || 0,
    quartos: Number(p.get("quartos")) || 0,
    ordem: p.get("ordem") ?? "recentes",
  };
}

export function aplicar(itens: ImovelCompleto[], f: Filtro) {
  const lista = itens.filter(
    (m) =>
      (f.categoria === "todos" || m.categorias.includes(f.categoria as never)) &&
      (!f.bairro || m.bairro === f.bairro) &&
      (!f.ate || m.total <= f.ate) &&
      (!f.quartos || m.quartos >= f.quartos),
  );
  if (f.ordem === "preco") lista.sort((a, b) => a.total - b.total);
  if (f.ordem === "ufsm") lista.sort((a, b) => a.minUfsm - b.minUfsm);
  return lista;
}
