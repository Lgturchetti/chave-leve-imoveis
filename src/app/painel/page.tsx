import type { Metadata } from "next";
import Link from "next/link";
import { Marca } from "@/components/marca";

export const metadata: Metadata = { title: "Área do corretor" };

// Parte 3: login e painel. Por enquanto, aviso.
export default function Painel() {
  return (
    <div className="mx-auto grid max-w-md place-items-center px-margem py-24 text-center">
      <Marca tamanho={48} />
      <h1 className="mt-5 text-[30px]">Área do corretor</h1>
      <p className="mt-2 text-suave">O painel para cadastrar imóveis e confirmar visitas está sendo construído.</p>
      <Link href="/" className="botao botao-contorno mt-6">
        Voltar aos imóveis
      </Link>
    </div>
  );
}
