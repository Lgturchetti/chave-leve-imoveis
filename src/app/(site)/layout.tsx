import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";

// Site público: cabeçalho e rodapé. O painel tem o próprio layout.
export default function LayoutSite({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cabecalho />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <Rodape />
    </>
  );
}
