import Link from "next/link";

export default function NaoEncontrada() {
  return (
    <div className="mx-auto max-w-xl px-margem py-24 text-center">
      <h1 className="text-[clamp(30px,5vw,48px)]">Não achamos essa página.</h1>
      <p className="mt-3 text-suave">O imóvel pode ter sido alugado, ou o endereço mudou.</p>
      <Link href="/" className="botao botao-acao mt-6">
        Ver imóveis disponíveis
      </Link>
    </div>
  );
}
