"use client";

import { Drawer } from "@base-ui/react/drawer";
import { useActionState, useEffect, useRef, useState } from "react";
import { pedirVisita } from "@/app/(site)/imovel/actions";
import { type CampoVisita, type EstadoVisita, proximosDias } from "@/data/visita";

const inicial: EstadoVisita = { status: "inicial" };

// Se o firewall barrar (muitos envios) ou cair a internet: aviso no próprio painel (lição da clínica)
async function enviar(anterior: EstadoVisita, fd: FormData): Promise<EstadoVisita> {
  try {
    return await pedirVisita(anterior, fd);
  } catch {
    return { status: "erro", bloqueado: true, mensagem: "Não foi possível enviar agora. Aguarde um minuto ou chame no WhatsApp." };
  }
}

// "Agendar visita": painel que sobe de baixo (celular) / janela (desktop). Dia + turno + nome + WhatsApp.
export function AgendarVisita({ codigo, titulo, className = "" }: { codigo: string; titulo: string; className?: string }) {
  const [aberto, setAberto] = useState(false);
  return (
    <Drawer.Root open={aberto} onOpenChange={setAberto}>
      <Drawer.Trigger className={`botao botao-acao ${className}`}>Agendar visita</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-tinta opacity-[calc(0.35*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[380ms] ease-gaveta data-ending-style:opacity-0 data-ending-style:duration-200 data-starting-style:opacity-0 data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute" />
        <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <Drawer.Popup className="max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-[26px] bg-superficie px-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 shadow-flutua outline-none [transform:translateY(var(--drawer-swipe-movement-y))] transition-[transform,opacity] duration-[380ms] ease-gaveta data-ending-style:duration-200 data-swiping:select-none max-sm:data-ending-style:[transform:translateY(100%)] max-sm:data-starting-style:[transform:translateY(100%)] sm:w-[480px] sm:rounded-[26px] sm:pb-6 sm:data-ending-style:scale-[0.98] sm:data-ending-style:opacity-0 sm:data-starting-style:scale-[0.98] sm:data-starting-style:opacity-0 motion-reduce:transition-none">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-tinta/20 sm:hidden" aria-hidden="true" />
            {aberto && <Formulario codigo={codigo} titulo={titulo} />}
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function Formulario({ codigo, titulo }: { codigo: string; titulo: string }) {
  const [estado, acao, enviando] = useActionState(enviar, inicial);
  const [dias] = useState(() => proximosDias());
  const [dia, setDia] = useState(dias[0].iso);
  const [turno, setTurno] = useState("manha");
  const inicio = useRef<HTMLInputElement>(null);
  const abertoEm = useRef(0);
  const aviso = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abertoEm.current) abertoEm.current = Date.now();
    if (inicio.current) inicio.current.value = String(abertoEm.current);
    if (estado.status === "erro") (document.querySelector<HTMLElement>("[data-visita] [aria-invalid=true]") ?? aviso.current)?.focus();
    if (estado.status === "enviado") aviso.current?.focus();
  }, [estado]);

  if (estado.status === "enviado") {
    return (
      <div ref={aviso} tabIndex={-1} role="status" className="entra py-4 text-center outline-none">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-limao" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b1220" strokeWidth="2.6"><path d="m5 12 5 5 9-10" /></svg>
        </span>
        <Drawer.Title className="mt-3 font-titulo text-[22px] font-semibold tracking-[-0.03em]">Pedido enviado</Drawer.Title>
        <p className="mt-1 text-suave">O corretor confirma pelo WhatsApp em até 2 horas.</p>
        {estado.demonstracao && <p className="mt-3 text-[14px] text-suave">Site de demonstração: o pedido foi para o painel de exemplo da imobiliária. Ninguém vai entrar em contato.</p>}
        <Drawer.Close className="botao botao-contorno mt-5">Fechar</Drawer.Close>
      </div>
    );
  }

  const erro = (c: CampoVisita) => estado.erros?.[c];
  const chip = (marcado: boolean, onClick: () => void, filhos: React.ReactNode, rotulo: string, chave?: string) => (
    <button key={chave} type="button" aria-pressed={marcado} aria-label={rotulo} onClick={onClick} className="min-h-11 min-w-16 shrink-0 cursor-pointer select-none rounded-2xl border border-linha bg-fundo px-3 py-2 text-center transition-[background-color,color,border-color,transform] duration-150 active:scale-[0.96] aria-pressed:border-acao aria-pressed:bg-acao aria-pressed:text-white">
      {filhos}
    </button>
  );
  const campo = "mt-1.5 block w-full rounded-2xl border border-linha bg-fundo px-4 py-3 focus:border-acao focus:outline-none focus:ring-2 focus:ring-acao/20 aria-[invalid=true]:border-red-700";

  return (
    <form action={acao} noValidate data-visita>
      <Drawer.Title className="font-titulo text-[22px] font-semibold tracking-[-0.03em]">Agendar visita</Drawer.Title>
      <Drawer.Description className="mt-1 text-[14px] text-suave">
        {titulo} ({codigo}). O corretor confirma pelo WhatsApp em até 2 horas.
      </Drawer.Description>

      {estado.status === "erro" && (
        <div ref={aviso} tabIndex={-1} role="alert" className="mt-4 rounded-2xl border border-red-800/30 bg-red-50 p-3 text-[15px] text-red-900">
          {estado.mensagem}
        </div>
      )}

      <fieldset className="mt-5">
        <legend className="text-[14px] font-semibold">Dia</legend>
        <div className="-mx-6 mt-2 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none]" data-base-ui-swipe-ignore>
          {dias.map((d) =>
            chip(dia === d.iso, () => setDia(d.iso), <><small className="block text-[12px] opacity-80">{d.semana}</small><b className="text-[18px] tabular-nums">{d.dia}</b></>, `${d.semana}, dia ${d.dia}`, d.iso),
          )}
        </div>
      </fieldset>
      <fieldset className="mt-4">
        <legend className="text-[14px] font-semibold">Turno</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {chip(turno === "manha", () => setTurno("manha"), "Manhã", "Manhã")}
          {chip(turno === "tarde", () => setTurno("tarde"), "Tarde", "Tarde")}
        </div>
      </fieldset>

      <label className="mt-4 block text-[14px] font-semibold">
        Seu nome
        <input name="nome" autoComplete="name" autoCapitalize="words" enterKeyHint="next" maxLength={80} defaultValue={estado.valores?.nome} aria-invalid={!!erro("nome") || undefined} aria-describedby={erro("nome") ? "erro-nome" : undefined} className={campo} />
      </label>
      {erro("nome") && <p id="erro-nome" className="mt-1 text-[14px] text-red-800">{erro("nome")}</p>}
      <label className="mt-3 block text-[14px] font-semibold">
        WhatsApp
        <input name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="send" placeholder="(55) 99999-9999" maxLength={20} defaultValue={estado.valores?.whatsapp} aria-invalid={!!erro("whatsapp") || undefined} aria-describedby={erro("whatsapp") ? "erro-whats" : undefined} className={`${campo} placeholder:text-suave`} />
      </label>
      {erro("whatsapp") && <p id="erro-whats" className="mt-1 text-[14px] text-red-800">{erro("whatsapp")}</p>}

      <input type="hidden" name="codigo" value={codigo} />
      <input type="hidden" name="dia" value={dia} />
      <input type="hidden" name="turno" value={turno} />
      <input ref={inicio} type="hidden" name="inicio" defaultValue="0" />
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Não preencha
          <input name="cl_extra" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button type="submit" disabled={enviando} className="botao botao-acao mt-5 w-full">
        {enviando ? "Enviando…" : "Pedir visita"}
      </button>
      {/* Site de cliente: "Usamos seus dados só para combinar a visita." Na demonstração o painel é aberto a visitantes. */}
      <p className="mt-3 text-center text-[13px] text-suave">Site de demonstração: o pedido aparece num painel aberto a visitantes. Use nome e número fictícios.</p>
    </form>
  );
}
