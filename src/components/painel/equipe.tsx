"use client";

import { useActionState, useState, useTransition } from "react";
import { criarLogin, criarPessoa, gerarSenha, mudarAtivo, type ResultadoSenha } from "@/app/painel/(app)/equipe/acoes";
import { campo, rotulo } from "@/components/painel/campos";

export type Pessoa = {
  id: string; nome: string; papel: string; creci: string | null; whatsapp: string; ativo: boolean;
  temLogin: boolean; senhaProvisoria: boolean; eu: boolean;
};

export function Equipe({ pessoas, nomeDono }: { pessoas: Pessoa[]; nomeDono: string }) {
  const [resultado, setResultado] = useState<ResultadoSenha | null>(null);

  return (
    <>
      {resultado?.senha && <SenhaGerada r={resultado} nomeDono={nomeDono} aoFechar={() => setResultado(null)} />}
      <ul className="mt-6 grid gap-3">
        {pessoas.map((p) => (
          <CartaoPessoa key={p.id} p={p} aoGerar={setResultado} />
        ))}
      </ul>
      <NovaPessoa aoCriar={setResultado} />
    </>
  );
}

function SenhaGerada({ r, nomeDono, aoFechar }: { r: ResultadoSenha; nomeDono: string; aoFechar: () => void }) {
  const [copiado, setCopiado] = useState(false);
  const site = typeof window === "undefined" ? "" : `${location.origin}/painel`;
  const texto = `Oi, ${r.nome?.split(" ")[0]}! Seu acesso ao painel da Chave Leve:\n${site}\nE-mail: ${r.email ?? "(o seu e-mail)"}\nSenha provisória: ${r.senha}\nNo primeiro acesso o painel pede para você criar a sua senha.\n— ${nomeDono.split(" ")[0]}`;
  return (
    <div role="status" className="mt-6 rounded-cartao border-2 border-acao bg-superficie p-5 shadow-suave">
      <p className="font-semibold">Senha provisória de {r.nome}</p>
      <p className="mt-2 select-all rounded-2xl bg-fundo px-4 py-3 font-titulo text-[22px] font-semibold tracking-wide tabular-nums">{r.senha}</p>
      <p className="mt-2 text-[14px] text-suave">Ela aparece só agora. Mande para a pessoa; no primeiro acesso, ela cria a própria senha.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(texto);
              setCopiado(true);
            } catch {}
          }}
          className="botao botao-acao botao-pequeno"
        >
          {copiado ? "Copiado" : "Copiar mensagem"}
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener noreferrer" className="botao botao-contorno botao-pequeno">
          Enviar pelo WhatsApp
        </a>
        <button type="button" onClick={aoFechar} className="botao botao-contorno botao-pequeno">
          Fechar
        </button>
      </div>
    </div>
  );
}

function CartaoPessoa({ p, aoGerar }: { p: Pessoa; aoGerar: (r: ResultadoSenha) => void }) {
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState("");
  const [email, setEmail] = useState("");
  const [abrirLogin, setAbrirLogin] = useState(false);

  const rodar = (f: () => Promise<ResultadoSenha | { erro?: string }>) =>
    iniciar(async () => {
      setErro("");
      const r = await f();
      if (r.erro) setErro(r.erro);
      else if ("senha" in r && r.senha) {
        aoGerar(r);
        setAbrirLogin(false);
      }
    });

  return (
    <li className={`rounded-cartao bg-superficie p-5 shadow-suave ${p.ativo ? "" : "opacity-70"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold [overflow-wrap:anywhere]">
            {p.nome} {p.eu && <span className="font-normal text-suave">(você)</span>}
          </p>
          <p className="text-[14px] text-suave">
            {p.papel === "dono" ? "Dono" : "Corretor"}
            {p.creci ? ` · ${p.creci}` : ""}
          </p>
        </div>
        <span className="rounded-full bg-fundo px-2.5 py-1 text-[12px] font-semibold text-suave">
          {!p.ativo ? "Desativado" : !p.temLogin ? "Sem login" : p.senhaProvisoria ? "Senha provisória" : "Ativo"}
        </span>
      </div>

      {!p.eu && (
        <div className="mt-4 flex flex-wrap gap-2">
          {p.ativo && !p.temLogin && !abrirLogin && (
            <button type="button" onClick={() => setAbrirLogin(true)} className="botao botao-acao botao-pequeno">
              Criar login
            </button>
          )}
          {p.ativo && p.temLogin && (
            <button type="button" disabled={pendente} onClick={() => rodar(() => gerarSenha(p.id, p.nome))} className="botao botao-contorno botao-pequeno">
              Gerar senha nova
            </button>
          )}
          <button type="button" disabled={pendente} onClick={() => rodar(() => mudarAtivo(p.id, !p.ativo))} className="botao botao-contorno botao-pequeno">
            {p.ativo ? "Desativar" : "Reativar"}
          </button>
        </div>
      )}

      {abrirLogin && (
        <form
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            rodar(() => criarLogin(p.id, p.nome, email));
          }}
        >
          <label className={rotulo}>
            E-mail de {p.nome.split(" ")[0]}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" autoCapitalize="none" spellCheck={false} className={campo} />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={pendente} className="botao botao-acao">
              {pendente ? "Criando…" : "Criar"}
            </button>
            <button type="button" onClick={() => setAbrirLogin(false)} className="botao botao-contorno">
              Cancelar
            </button>
          </div>
        </form>
      )}
      {erro && (
        <p role="alert" className="mt-2 text-[14px] text-red-800">
          {erro}
        </p>
      )}
    </li>
  );
}

function NovaPessoa({ aoCriar }: { aoCriar: (r: ResultadoSenha) => void }) {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState<ResultadoSenha, FormData>(async (a, fd) => {
    const r = await criarPessoa(a, fd);
    if (r.senha) {
      aoCriar(r);
      setAberto(false);
    }
    return r;
  }, {});

  if (!aberto) {
    return (
      <button type="button" onClick={() => setAberto(true)} className="botao botao-contorno mt-6">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        Adicionar corretor
      </button>
    );
  }
  return (
    <form action={acao} className="mt-6 grid gap-4 rounded-cartao bg-superficie p-5 shadow-suave sm:grid-cols-2 sm:p-6">
      <h2 className="text-[20px] sm:col-span-2">Novo corretor</h2>
      {estado.erro && (
        <p role="alert" className="rounded-2xl border border-red-800/30 bg-red-50 p-3 text-[15px] text-red-900 sm:col-span-2">
          {estado.erro}
        </p>
      )}
      <label className={rotulo}>
        Nome
        <input name="nome" required maxLength={80} autoComplete="off" autoCapitalize="words" className={campo} />
      </label>
      <label className={rotulo}>
        E-mail (para entrar)
        <input name="email" type="email" required maxLength={120} autoComplete="off" autoCapitalize="none" spellCheck={false} className={campo} />
      </label>
      <label className={rotulo}>
        WhatsApp
        <input name="whatsapp" type="tel" inputMode="tel" required maxLength={20} placeholder="(55) 99999-9999" className={`${campo} placeholder:text-suave`} />
      </label>
      <label className={rotulo}>
        CRECI <span className="font-normal text-suave">(opcional)</span>
        <input name="creci" maxLength={40} className={campo} />
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={enviando} className="botao botao-acao">
          {enviando ? "Criando…" : "Criar e gerar senha"}
        </button>
        <button type="button" onClick={() => setAberto(false)} className="botao botao-contorno">
          Cancelar
        </button>
      </div>
    </form>
  );
}
