import { Cabecalho } from "@/components/cabecalho";
import { NaoEncontrada } from "@/components/nao-encontrada";
import { Rodape } from "@/components/rodape";

// Endereço que não existe em lugar nenhum: mesma página, com cabeçalho e rodapé do site
export default function NaoEncontradaGeral() {
  return (
    <>
      <Cabecalho />
      <main id="conteudo" className="flex-1">
        <NaoEncontrada />
      </main>
      <Rodape />
    </>
  );
}
