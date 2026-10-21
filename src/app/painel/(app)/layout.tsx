import { Suspense } from "react";
import { NavEsqueleto, NavPainel } from "@/components/painel/nav";
import { exigirSessao } from "@/lib/painel";

async function NavComSessao() {
  const { perfil, dono } = await exigirSessao({ trocandoSenha: true });
  return <NavPainel dono={dono} nome={perfil.nome} />;
}

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <Suspense fallback={<NavEsqueleto />}>
        <NavComSessao />
      </Suspense>
      <main id="conteudo" className="min-w-0 pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-16">
        {children}
      </main>
    </div>
  );
}
