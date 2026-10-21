"use client";

import { useActionState, useEffect, useRef } from "react";
import { enviarProprietario } from "@/app/(site)/proprietarios/actions";
import type { CampoProprietario, EstadoProprietario } from "@/data/proprietario";

const inicial: EstadoProprietario = { status: "inicial" };

async function enviar(a: EstadoProprietario, fd: FormData): Promise<EstadoProprietario> {
  try {
    return await enviarProprietario(a, fd);
  } catch {
    const valores = Object.fromEntries(["nome", "whatsapp", "bairro", "mensagem"].map((c) => [c, String(fd.get(c) ?? "")]));
    return { status: "erro", bloqueado: true, valores, mensagem: "Não foi possível enviar agora. Aguarde um minuto e tente de novo." };
  }
}

const campo = "mt-1.5 block w-full rounded-2xl border border-linha bg-fundo px-4 py-3 focus:border-acao focus:outline-none focus:ring-2 focus:ring-acao/20 aria-[invalid=true]:border-red-700";

export function FormularioProprietario() {
  const [estado, acao, enviando] = useActionState(enviar, inicial);
  const inicio = useRef<HTMLInputElement>(null);
  const abertoEm = useRef(0);
  const aviso = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abertoEm.current) abertoEm.current = Date.now();
    // defaultValue também: o React limpa o formulário depois de cada envio e a limpeza volta ao valor padrão
    if (inicio.current) inicio.current.defaultValue = inicio.current.value = String(abertoEm.current);
    if (estado.status === "erro") (document.querySelector<HTMLElement>("[data-proprietario] [aria-invalid=true]") ?? aviso.current)?.focus();
    if (estado.status === "enviado") aviso.current?.focus();
  }, [estado]);

  if (estado.status === "enviado") {
    return (
      <div ref={aviso} tabIndex={-1} role="status" className="entra mt-6 rounded-2xl bg-limao/40 p-6 outline-none">
        <p className="font-titulo text-[22px] font-semibold tracking-[-0.03em]">Recebemos seu contato.</p>
        <p className="mt-1">Respondemos pelo WhatsApp em até 1 dia útil.</p>
        {estado.demonstracao && <p className="mt-3 text-[14px] text-suave">Site de demonstração: o contato foi para o painel de exemplo. Ninguém vai entrar em contato.</p>}
      </div>
    );
  }

  const erro = (c: CampoProprietario) => estado.erros?.[c];
  const props = (c: CampoProprietario) => ({
    name: c,
    defaultValue: estado.valores?.[c],
    "aria-invalid": erro(c) ? true : undefined,
    "aria-describedby": erro(c) ? `erro-${c}` : undefined,
  });
  const msg = (c: CampoProprietario) => erro(c) && <p id={`erro-${c}`} className="mt-1 text-[14px] text-red-800">{erro(c)}</p>;

  return (
    <form action={acao} noValidate className="mt-6 space-y-4" data-proprietario>
      {estado.status === "erro" && (
        <div ref={aviso} tabIndex={-1} role="alert" className="rounded-2xl border border-red-800/30 bg-red-50 p-3 text-[15px] text-red-900">
          {estado.mensagem}
        </div>
      )}
      <div>
        <label className="block text-[14px] font-semibold">
          Seu nome
          <input {...props("nome")} autoComplete="name" autoCapitalize="words" maxLength={80} className={campo} />
        </label>
        {msg("nome")}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[14px] font-semibold">
            WhatsApp
            <input {...props("whatsapp")} type="tel" inputMode="tel" autoComplete="tel" placeholder="(55) 99999-9999" maxLength={20} className={`${campo} placeholder:text-suave`} />
          </label>
          {msg("whatsapp")}
        </div>
        <div>
          <label className="block text-[14px] font-semibold">
            Bairro do imóvel
            <input {...props("bairro")} maxLength={60} className={campo} />
          </label>
          {msg("bairro")}
        </div>
      </div>
      <label className="block text-[14px] font-semibold">
        Conte sobre o imóvel <span className="font-normal text-suave">(opcional)</span>
        <textarea {...props("mensagem")} rows={4} maxLength={1000} className={campo} />
      </label>
      <input ref={inicio} type="hidden" name="inicio" defaultValue="0" />
      <button type="submit" disabled={enviando} className="botao botao-acao w-full sm:w-auto">
        {enviando ? "Enviando…" : "Quero anunciar"}
      </button>
      {/* Site de cliente: "Usamos seus dados só para entrar em contato sobre o imóvel." Na demonstração o painel é aberto a visitantes. */}
      <p className="text-[13px] text-suave">Site de demonstração: o contato aparece num painel aberto a visitantes. Use nome e número fictícios.</p>
    </form>
  );
}
