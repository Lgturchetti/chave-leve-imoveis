import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BotaoApagarImovel } from "@/components/painel/botao-apagar-imovel";
import { Carregando, Pagina } from "@/components/painel/carregando";
import { FormImovel, type DadosImovel } from "@/components/painel/form-imovel";
import { FotosImovel } from "@/components/painel/fotos-imovel";
import { SeloStatus } from "@/components/painel/selo-status";
import { exigirSessao, statusImovel } from "@/lib/painel";
import { urlFoto } from "@/lib/supabase/publico";
import { opcoesFormulario } from "../dados";

export const metadata: Metadata = { title: "Editar imóvel" };

async function Conteudo({ params, searchParams }: PageProps<"/painel/imoveis/[codigo]">) {
  const { codigo } = await params;
  const { novo } = await searchParams;
  if (!/^CL-\d{4}$/.test(codigo)) notFound();
  const sessao = await exigirSessao();
  const { data } = await sessao.supabase
    .from("imoveis")
    .select("id, codigo, titulo, tipo, bairro, endereco, lat, lon, quartos, banheiros, area, vagas, mobiliado, aceita_pet, para_dividir, aluguel, condominio, iptu, descricao, status, corretor_id, fotos(id, caminho, alt, ordem)")
    .eq("codigo", codigo)
    .maybeSingle();
  if (!data) notFound();

  const { fotos, codigo: cod, ...dados } = data as DadosImovel & { codigo: string; fotos: { id: string; caminho: string; alt: string; ordem: number }[] };
  const { bairros, corretores } = await opcoesFormulario(sessao);
  const ordenadas = [...fotos].sort((a, b) => a.ordem - b.ordem).map((f) => ({ ...f, url: urlFoto(f.caminho) }));
  const publico = dados.status === "disponivel" || dados.status === "reservado";
  const status = dados.status as keyof typeof statusImovel;

  return (
    <>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-[clamp(24px,4vw,32px)] [overflow-wrap:anywhere]">{dados.titulo}</h1>
        <SeloStatus status={status} rotulo={statusImovel[status]} />
      </div>
      <p className="mt-1 text-suave">
        {cod}
        {publico && (
          <>
            {" · "}
            <Link href={`/imovel/${cod}`} target="_blank" className="font-semibold text-acao underline-offset-4 hover:underline">
              Ver no site
            </Link>
          </>
        )}
      </p>
      {novo && (
        <p role="status" className="mt-4 rounded-2xl bg-limao/50 p-3 text-[15px]">
          Imóvel criado como rascunho. Agora adicione as fotos e, quando estiver pronto, mude a situação para “Disponível”.
        </p>
      )}
      <div className="mt-6 grid gap-6">
        <FotosImovel imovelId={dados.id} titulo={dados.titulo} fotosIniciais={ordenadas} urlBase={urlFoto("").replace(/\/$/, "")} />
        <FormImovel imovel={dados} bairros={bairros} corretores={corretores} dono={sessao.dono} qtdFotos={fotos.length} />
        {sessao.dono && <BotaoApagarImovel id={dados.id} titulo={dados.titulo} />}
      </div>
    </>
  );
}

export default function EditarImovel(props: PageProps<"/painel/imoveis/[codigo]">) {
  return (
    <Pagina>
      <Link href="/painel/imoveis" className="text-[14px] font-semibold text-suave underline-offset-4 hover:underline">
        ← Imóveis
      </Link>
      <Suspense fallback={<div className="mt-4"><Carregando /></div>}>
        <Conteudo {...props} />
      </Suspense>
    </Pagina>
  );
}
