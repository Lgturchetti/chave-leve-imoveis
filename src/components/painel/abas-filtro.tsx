import Link from "next/link";

// Abas simples por endereço (?situacao=…): "voltar" funciona e dá para guardar o link
export function AbasFiltro({ base, atual, abas }: { base: string; atual: string; abas: { id: string; nome: string; qtd?: number }[] }) {
  return (
    <nav aria-label="Filtrar" className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
      {abas.map((a, i) => (
        <Link
          key={a.id}
          href={i === 0 ? base : `${base}?situacao=${a.id}`}
          aria-current={atual === a.id ? "page" : undefined}
          className="botao botao-pequeno shrink-0 border-linha bg-superficie aria-[current=page]:border-tinta aria-[current=page]:bg-tinta aria-[current=page]:text-white"
        >
          {a.nome}
          {a.qtd !== undefined && <span className="tabular-nums opacity-70">{a.qtd}</span>}
        </Link>
      ))}
    </nav>
  );
}
