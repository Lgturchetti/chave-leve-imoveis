// Selo de situação (imóvel ou pedido). Cor só reforça: o texto sempre diz a situação.
const cores: Record<string, string> = {
  rascunho: "bg-[#e9edf3] text-suave",
  disponivel: "bg-limao text-tinta",
  reservado: "bg-[#ffe7b8] text-[#6b4500]",
  alugado: "bg-tinta text-white",
  novo: "bg-acao text-white",
  em_andamento: "bg-[#dfe6ff] text-[#1a2f99]",
  concluido: "bg-[#e9edf3] text-suave",
  cancelado: "bg-[#e9edf3] text-suave line-through decoration-1",
};

export function SeloStatus({ status, rotulo }: { status: string; rotulo: string }) {
  return <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold leading-none ${cores[status] ?? ""}`}>{rotulo}</span>;
}
