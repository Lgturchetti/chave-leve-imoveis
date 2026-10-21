// Esqueleto simples enquanto o painel busca os dados
export function Carregando({ linhas = 4 }: { linhas?: number }) {
  return (
    <div className="grid gap-3" role="status" aria-busy="true" aria-label="Carregando">
      <div className="h-9 w-48 animate-pulse rounded-full bg-[#e3e8ef]" />
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-cartao bg-[#e9edf3]" />
      ))}
    </div>
  );
}

export function Pagina({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1080px] px-margem pt-3 lg:px-10 lg:pt-10">{children}</div>;
}
