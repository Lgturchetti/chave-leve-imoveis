import { Suspense } from "react";
import { NavEsqueleto, NavPainel } from "@/components/painel/nav";
import { exigirSessao } from "@/lib/painel";

async function NavComSessao() {
  const { perfil, dono, demo } = await exigirSessao({ trocandoSenha: true });
  return <NavPainel dono={dono} demo={demo} nome={perfil.nome} />;
}

// Faixa fixa no topo enquanto o visitante da demonstração está no painel
async function AvisoDemo() {
  const { demo } = await exigirSessao({ trocandoSenha: true });
  if (!demo) return null;
  return (
    <p className="bg-limao px-margem py-2 text-center text-[14px] font-semibold lg:px-10">
      Modo demonstração: pode mexer à vontade. Tudo volta ao original às 3h da manhã.
    </p>
  );
}

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <Suspense fallback={<NavEsqueleto />}>
        <NavComSessao />
      </Suspense>
      <main id="conteudo" className="min-w-0 pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-16">
        <Suspense fallback={null}>
          <AvisoDemo />
        </Suspense>
        {children}
      </main>
    </div>
  );
}
