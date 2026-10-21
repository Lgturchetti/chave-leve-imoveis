"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { salvarImovel, type CampoImovel, type EstadoImovel } from "@/app/painel/(app)/imoveis/acoes";
import { ajuda, campo, rotulo } from "@/components/painel/campos";
import { MapaEscolher } from "@/components/painel/mapa-escolher";

export type DadosImovel = {
  id: string; titulo: string; tipo: string; bairro: string; endereco: string | null; lat: number; lon: number;
  quartos: number; banheiros: number; area: number; vagas: number; mobiliado: boolean; aceita_pet: boolean; para_dividir: boolean;
  aluguel: number; condominio: number; iptu: number; descricao: string; status: string; corretor_id: string;
};

// Centro aproximado dos bairros mais comuns: atalho para marcar a região sem mexer no mapa
const centros: Record<string, { lat: number; lon: number }> = {
  Camobi: { lat: -29.712, lon: -53.722 },
  Centro: { lat: -29.687, lon: -53.807 },
  Bonfim: { lat: -29.69, lon: -53.817 },
  Medianeira: { lat: -29.7, lon: -53.81 },
  "Nossa Senhora de Lourdes": { lat: -29.6935, lon: -53.7975 },
  "Nossa Senhora das Dores": { lat: -29.6835, lon: -53.7925 },
  "Nossa Senhora de Fátima": { lat: -29.693, lon: -53.801 },
  "Nossa Senhora do Rosário": { lat: -29.681, lon: -53.81 },
  Patronato: { lat: -29.684, lon: -53.822 },
  "Duque de Caxias": { lat: -29.676, lon: -53.806 },
};

const tipos = [["kitnet", "Kitnet"], ["studio", "Studio"], ["apartamento", "Apartamento"], ["casa", "Casa"]] as const;
const situacoes = [
  ["rascunho", "Rascunho", "Só a equipe vê."],
  ["disponivel", "Disponível", "Aparece no site."],
  ["reservado", "Reservado", "Aparece no site com o aviso “Reservado”."],
  ["alugado", "Alugado", "Sai do site e fica guardado."],
] as const;

type Props = {
  imovel?: DadosImovel;
  bairros: string[];
  corretores: { id: string; nome: string }[];
  dono: boolean;
  qtdFotos?: number;
};

export function FormImovel({ imovel, bairros, corretores, dono, qtdFotos = 0 }: Props) {
  const [estado, acao, salvando] = useActionState<EstadoImovel, FormData>(salvarImovel, { status: "inicial" });
  const [ponto, setPonto] = useState(imovel ? { lat: imovel.lat, lon: imovel.lon } : null);
  const [bairro, setBairro] = useState(imovel?.bairro ?? "");
  const [descricao, setDescricao] = useState(imovel?.descricao ?? "");
  const aviso = useRef<HTMLDivElement>(null);
  const novo = !imovel;

  useEffect(() => {
    if (estado.status === "inicial") return;
    const errado = document.querySelector<HTMLElement>("[data-form-imovel] [aria-invalid=true]");
    (errado ?? aviso.current)?.focus();
  }, [estado]);

  const erro = (c: CampoImovel) => estado.erros?.[c];
  const marca = (c: CampoImovel) => ({ "aria-invalid": erro(c) ? true : undefined, "aria-describedby": erro(c) ? `erro-${c}` : undefined });
  const msg = (c: CampoImovel) => erro(c) && <span id={`erro-${c}`} className="mt-1 block text-[14px] font-normal text-red-800">{erro(c)}</span>;
  const centroBairro = centros[bairro.trim()];

  return (
    // onSubmit em vez de action: o React não limpa o formulário se der erro (a pessoa não perde o que digitou)
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => acao(fd));
      }}
      noValidate
      className="grid gap-6"
      data-form-imovel
    >
      {imovel && <input type="hidden" name="id" value={imovel.id} />}
      <input type="hidden" name="lat" value={ponto?.lat ?? ""} />
      <input type="hidden" name="lon" value={ponto?.lon ?? ""} />

      {estado.status !== "inicial" && (
        <div
          ref={aviso}
          tabIndex={-1}
          role={estado.status === "erro" ? "alert" : "status"}
          className={`rounded-2xl p-3 text-[15px] outline-none ${estado.status === "erro" ? "border border-red-800/30 bg-red-50 text-red-900" : "bg-limao/50"}`}
        >
          {estado.mensagem}
        </div>
      )}

      <Secao titulo="O imóvel">
        <label className={rotulo}>
          Título do anúncio
          <input name="titulo" defaultValue={imovel?.titulo} maxLength={70} {...marca("titulo")} className={campo} placeholder="Ex.: Kitnet mobiliada a 8 min da UFSM" />
          <span className={`${ajuda} block font-normal`}>Até 70 letras. Diga o tipo e o principal ponto forte.</span>
          {msg("titulo")}
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={rotulo}>
            Tipo
            <select name="tipo" defaultValue={imovel?.tipo ?? ""} {...marca("tipo")} className={campo}>
              <option value="" disabled>
                Escolha
              </option>
              {tipos.map(([v, n]) => (
                <option key={v} value={v}>
                  {n}
                </option>
              ))}
            </select>
            {msg("tipo")}
          </label>
          <label className={rotulo}>
            Bairro
            <input name="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} list="bairros" maxLength={40} autoComplete="off" {...marca("bairro")} className={campo} />
            <datalist id="bairros">
              {[...new Set([...bairros, ...Object.keys(centros)])].sort().map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
            {msg("bairro")}
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(
            [
              ["quartos", "Quartos", imovel?.quartos ?? 1],
              ["banheiros", "Banheiros", imovel?.banheiros ?? 1],
              ["area", "Área (m²)", imovel?.area ?? ""],
              ["vagas", "Vagas", imovel?.vagas ?? 0],
            ] as const
          ).map(([c, n, v]) => (
            <label key={c} className={rotulo}>
              {n}
              <input name={c} type="text" inputMode="numeric" pattern="[0-9]*" defaultValue={v} maxLength={4} {...marca(c)} className={`${campo} tabular-nums`} />
              {msg(c)}
            </label>
          ))}
        </div>
        <fieldset>
          <legend className={rotulo}>Destaques</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                ["mobiliado", "Mobiliado", imovel?.mobiliado],
                ["aceita_pet", "Aceita pet", imovel?.aceita_pet],
                ["para_dividir", "Bom para dividir", imovel?.para_dividir],
              ] as const
            ).map(([c, n, v]) => (
              <label key={c} className="flex cursor-pointer select-none items-center gap-2.5 rounded-full border border-linha bg-superficie py-2.5 pl-3.5 pr-4 text-[15px] font-semibold has-[:checked]:border-acao has-[:checked]:bg-acao/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-acao">
                <input type="checkbox" name={c} defaultChecked={v} className="size-4 accent-acao" />
                {n}
              </label>
            ))}
          </div>
        </fieldset>
        <label className={rotulo}>
          Descrição
          <textarea
            name="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={5}
            maxLength={1200}
            {...marca("descricao")}
            className={campo}
            placeholder="Como é o imóvel, o que tem perto, para quem é bom."
          />
          <span className={`${ajuda} flex justify-between font-normal`}>
            <span>Sem telefone nem endereço: o contato é pelo site.</span>
            <span className="tabular-nums">{descricao.length}/1200</span>
          </span>
          {msg("descricao")}
        </label>
      </Secao>

      <Secao titulo="Custos por mês" descricao="O site soma tudo e mostra o total.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(
            [
              ["aluguel", "Aluguel", imovel?.aluguel],
              ["condominio", "Condomínio", imovel?.condominio ?? 0],
              ["iptu", "IPTU (por mês)", imovel?.iptu ?? 0],
            ] as const
          ).map(([c, n, v]) => (
            <label key={c} className={rotulo}>
              {n}
              <span className="relative block">
                <span className="pointer-events-none absolute left-4 top-1/2 mt-[3px] -translate-y-1/2 text-suave">R$</span>
                <input name={c} type="text" inputMode="numeric" defaultValue={v} maxLength={6} {...marca(c)} className={`${campo} pl-11 tabular-nums`} />
              </span>
              {msg(c)}
            </label>
          ))}
        </div>
      </Secao>

      <Secao titulo="Onde fica" descricao="O site mostra só um círculo de 300 m. O endereço exato fica aqui, só para a equipe.">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className={rotulo} id="rotulo-mapa">
              Região no mapa
            </p>
            {centroBairro && (
              <button type="button" onClick={() => setPonto(centroBairro)} className="botao botao-contorno botao-pequeno">
                Marcar pelo bairro ({bairro.trim()})
              </button>
            )}
          </div>
          <MapaEscolher ponto={ponto} aoMudar={setPonto} invalido={Boolean(erro("regiao"))} />
          <p className={ajuda} aria-live="polite" id="erro-regiao">
            {erro("regiao") ? <span className="text-red-800">{erro("regiao")}</span> : ponto ? "Região marcada. Toque em outro ponto para mudar." : "Toque no mapa perto do imóvel."}
          </p>
        </div>
        <label className={rotulo}>
          Endereço exato <span className="font-normal text-suave">(só a equipe vê)</span>
          <input name="endereco" defaultValue={imovel?.endereco ?? ""} maxLength={160} autoComplete="off" className={campo} placeholder="Rua, número, apartamento" />
        </label>
      </Secao>

      <Secao titulo={novo ? "Responsável" : "Situação e responsável"}>
        {!novo && (
          <fieldset>
            <legend className={rotulo}>Situação</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {situacoes.map(([v, n, d]) => (
                <label
                  key={v}
                  className="flex cursor-pointer gap-3 rounded-2xl border border-linha bg-superficie p-3.5 has-[:checked]:border-acao has-[:checked]:bg-acao/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-acao"
                >
                  <input type="radio" name="status" value={v} defaultChecked={imovel?.status === v} className="mt-1 size-4 accent-acao" {...marca("status")} />
                  <span>
                    <span className="block font-semibold">{n}</span>
                    <span className="block text-[14px] text-suave">{d}</span>
                  </span>
                </label>
              ))}
            </div>
            {qtdFotos === 0 && <p className={ajuda}>Para publicar, adicione pelo menos uma foto (logo abaixo).</p>}
            {msg("status")}
          </fieldset>
        )}
        {dono ? (
          <label className={rotulo}>
            Corretor responsável
            <select name="corretor_id" defaultValue={imovel?.corretor_id ?? corretores[0]?.id} {...marca("corretor_id")} className={campo}>
              {corretores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            {msg("corretor_id")}
          </label>
        ) : (
          <p className="text-[15px] text-suave">{novo ? "O imóvel fica no seu nome." : "Você é o corretor responsável."}</p>
        )}
        {novo && <p className="text-[15px] text-suave">O imóvel começa como rascunho. Depois de salvar, você adiciona as fotos e publica.</p>}
      </Secao>

      <div className="sticky bottom-[calc(76px+env(safe-area-inset-bottom))] z-30 -mx-4 border-t border-linha bg-fundo/95 px-4 py-3 backdrop-blur lg:bottom-0 lg:mx-0 lg:rounded-t-2xl lg:px-0">
        <button type="submit" disabled={salvando} className="botao botao-acao w-full sm:w-auto">
          {salvando ? "Salvando…" : novo ? "Salvar e adicionar fotos" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}

function Secao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 rounded-cartao bg-superficie p-5 shadow-suave sm:p-6">
      <div>
        <h2 className="text-[20px]">{titulo}</h2>
        {descricao && <p className="mt-1 text-[15px] text-suave">{descricao}</p>}
      </div>
      {children}
    </section>
  );
}
