"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { adicionarFoto, adicionarFotoBiblioteca, legendarFoto, ordenarFotos, removerFoto, type FotoPainel } from "@/app/painel/(app)/imoveis/acoes";
import { BIBLIOTECA } from "@/data/biblioteca";
import { supabaseNavegador } from "@/lib/supabase/navegador";

const MAX = 15;
const LADO = 1600;

// Reduz no aparelho antes de enviar: foto de celular (4–12 MB) vira ~300 KB, já na orientação certa
async function preparar(arquivo: File): Promise<{ blob: Blob; ext: "webp" | "jpg" }> {
  const bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
  const escala = Math.min(1, LADO / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const gerar = (tipo: string, q: number) => new Promise<Blob | null>((ok) => canvas.toBlob(ok, tipo, q));
  const webp = await gerar("image/webp", 0.82);
  if (webp?.type === "image/webp") return { blob: webp, ext: "webp" };
  const jpg = await gerar("image/jpeg", 0.85); // Safari antigo não gera webp
  if (!jpg) throw new Error("conversao");
  return { blob: jpg, ext: "jpg" };
}

// demo = visitante da demonstração: escolhe da biblioteca de exemplo em vez de enviar arquivo
// Avisos do arrastar para leitor de tela, em português e por posição (o padrão do dnd-kit fala inglês com códigos)
function avisosArrastar(fotos: { id: string }[]) {
  const pos = (id: string | number | undefined) => fotos.findIndex((f) => f.id === id) + 1;
  const total = fotos.length;
  return {
    onDragStart: ({ active }: { active: { id: string | number } }) => `Foto ${pos(active.id)} de ${total} pega. Use as setas para mudar a posição.`,
    onDragOver: ({ active, over }: { active: { id: string | number }; over: { id: string | number } | null }) =>
      over ? `Foto ${pos(active.id)} sobre a posição ${pos(over.id)} de ${total}.` : `Foto ${pos(active.id)} fora da lista.`,
    onDragEnd: ({ active, over }: { active: { id: string | number }; over: { id: string | number } | null }) =>
      over ? `Foto ${pos(active.id)} solta na posição ${pos(over.id)} de ${total}.` : `Foto ${pos(active.id)} solta no lugar de antes.`,
    onDragCancel: ({ active }: { active: { id: string | number } }) => `Movimento cancelado. A foto ${pos(active.id)} voltou para o lugar.`,
  };
}

type Props = { imovelId: string; titulo: string; fotosIniciais: (FotoPainel & { url: string })[]; urlBase: string; demo?: boolean };

export function FotosImovel({ imovelId, titulo, fotosIniciais, urlBase, demo = false }: Props) {
  const [fotos, setFotos] = useState(fotosIniciais);
  const [enviando, setEnviando] = useState<{ feitas: number; total: number } | null>(null);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);
  const [, iniciar] = useTransition();
  const entrada = useRef<HTMLInputElement>(null);
  const [biblioteca, setBiblioteca] = useState(false);
  const [escolhendo, setEscolhendo] = useState<string | null>(null);

  async function escolher(caminho: string, alt: string) {
    setEscolhendo(caminho);
    setAviso(null);
    const r = await adicionarFotoBiblioteca(imovelId, caminho, alt);
    setEscolhendo(null);
    if (r.erro || !r.foto) return setAviso({ tipo: "erro", texto: r.erro ?? "Não foi possível adicionar a foto." });
    const nova = { ...r.foto, url: `${urlBase}/${r.foto.caminho}` };
    setFotos((f) => [...f, nova]);
    setAviso({ tipo: "ok", texto: "Foto adicionada." });
  }

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function enviar(lista: FileList | null) {
    if (!lista?.length) return;
    const arquivos = [...lista].filter((a) => a.type.startsWith("image/")).slice(0, MAX - fotos.length);
    if (!arquivos.length) {
      setAviso({ tipo: "erro", texto: fotos.length >= MAX ? `No máximo ${MAX} fotos.` : "Escolha arquivos de imagem." });
      return;
    }
    setAviso(null);
    setEnviando({ feitas: 0, total: arquivos.length });
    const supabase = supabaseNavegador();
    let falhas = 0;
    for (const [i, arquivo] of arquivos.entries()) {
      try {
        const { blob, ext } = await preparar(arquivo);
        const caminho = `imoveis/${imovelId}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("fotos").upload(caminho, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
        if (error) throw error;
        const r = await adicionarFoto(imovelId, caminho, `${titulo}: foto ${fotos.length + i + 1}`);
        if (r.erro || !r.foto) {
          await supabase.storage.from("fotos").remove([caminho]);
          throw new Error(r.erro);
        }
        const nova = { ...r.foto, url: `${urlBase}/${r.foto.caminho}` };
        setFotos((f) => [...f, nova]);
      } catch {
        falhas++;
      }
      setEnviando({ feitas: i + 1, total: arquivos.length });
    }
    setEnviando(null);
    if (entrada.current) entrada.current.value = "";
    setAviso(falhas ? { tipo: "erro", texto: `${falhas === 1 ? "1 foto não foi enviada" : `${falhas} fotos não foram enviadas`}. Tente de novo.` } : { tipo: "ok", texto: arquivos.length === 1 ? "Foto adicionada." : `${arquivos.length} fotos adicionadas.` });
  }

  function aoSoltar({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const antes = fotos;
    const depois = arrayMove(fotos, fotos.findIndex((f) => f.id === active.id), fotos.findIndex((f) => f.id === over.id));
    setFotos(depois);
    iniciar(async () => {
      const r = await ordenarFotos(imovelId, depois.map((f) => f.id));
      if (r.erro) {
        setFotos(antes);
        setAviso({ tipo: "erro", texto: r.erro });
      } else setAviso({ tipo: "ok", texto: "Ordem salva. A primeira foto é a capa." });
    });
  }

  function remover(id: string) {
    const antes = fotos;
    setFotos((f) => f.filter((x) => x.id !== id));
    iniciar(async () => {
      const r = await removerFoto(id);
      if (r.erro) {
        setFotos(antes);
        setAviso({ tipo: "erro", texto: r.erro });
      } else setAviso({ tipo: "ok", texto: "Foto removida." });
    });
  }

  return (
    <section className="grid gap-4 rounded-cartao bg-superficie p-5 shadow-suave sm:p-6" aria-labelledby="titulo-fotos">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="titulo-fotos" className="text-[20px]">
            Fotos <span className="font-sans text-[15px] font-normal tracking-normal text-suave tabular-nums">{fotos.length}/{MAX}</span>
          </h2>
          <p className="mt-1 text-[15px] text-suave">A primeira é a capa. Arraste pela alça para mudar a ordem.</p>
          <p role={aviso?.tipo === "erro" ? "alert" : "status"} className={`mt-1 text-[14px] font-semibold ${aviso?.tipo === "erro" ? "text-red-800" : "text-acao"}`}>
            {aviso?.texto}
          </p>
        </div>
        {demo ? (
          <button type="button" aria-expanded={biblioteca} aria-controls="biblioteca-fotos" onClick={() => setBiblioteca((b) => !b)} className="botao botao-acao botao-pequeno">
            {biblioteca ? "Fechar biblioteca" : "Escolher da biblioteca"}
          </button>
        ) : (
        <label className={`botao botao-acao botao-pequeno has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-acao ${enviando || fotos.length >= MAX ? "pointer-events-none opacity-60" : ""}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          {enviando ? `Enviando ${enviando.feitas + 1} de ${enviando.total}…` : "Adicionar fotos"}
          <input ref={entrada} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple className="sr-only" disabled={Boolean(enviando) || fotos.length >= MAX} onChange={(e) => enviar(e.target.files)} />
        </label>
        )}
      </div>

      {demo && biblioteca && (
        <div id="biblioteca-fotos" className="rounded-foto bg-fundo p-3 sm:p-4">
          <p className="text-[14px] text-suave">Na demonstração, as fotos vêm desta biblioteca (não dá para enviar arquivo). Toque para adicionar.</p>
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {BIBLIOTECA.map((b) => {
              const usada = fotos.some((f) => f.caminho === b.caminho);
              const bloqueada = usada || fotos.length >= MAX || escolhendo !== null;
              return (
                <li key={b.caminho}>
                  <button
                    type="button"
                    disabled={bloqueada}
                    onClick={() => escolher(b.caminho, b.alt)}
                    aria-label={usada ? `${b.alt}: No imóvel` : `Adicionar: ${b.alt}`}
                    className="relative block select-none aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-xl bg-superficie transition-transform duration-100 active:scale-[0.97] disabled:cursor-not-allowed"
                  >
                    <Image src={`${urlBase}/${b.caminho}`} alt="" fill sizes="(min-width: 1024px) 140px, 30vw" className={`object-cover ${usada ? "opacity-40" : ""}`} />
                    {usada && <span className="absolute inset-x-1 bottom-1 rounded-full bg-white/90 px-2 py-0.5 text-center text-[11px] font-semibold">No imóvel</span>}
                    {escolhendo === b.caminho && <span className="absolute inset-0 animate-pulse bg-white/50" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}


      {fotos.length === 0 && !enviando ? (
        <button
          type="button"
          onClick={() => (demo ? setBiblioteca(true) : entrada.current?.click())}
          className="grid min-h-40 cursor-pointer place-items-center rounded-foto border-2 border-dashed border-linha p-6 text-center text-suave transition-colors hover:border-acao hover:text-acao"
        >
          {demo ? "Nenhuma foto ainda. Toque para escolher da biblioteca." : "Nenhuma foto ainda. Toque para escolher do celular ou do computador."}
        </button>
      ) : (
        <DndContext id="fotos-imovel" sensors={sensores} collisionDetection={closestCenter} onDragEnd={aoSoltar} accessibility={{ screenReaderInstructions: { draggable: "Para mover, aperte espaço, use as setas e aperte espaço de novo para soltar." }, announcements: avisosArrastar(fotos) }}>
          <SortableContext items={fotos.map((f) => f.id)} strategy={rectSortingStrategy}>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {fotos.map((f, i) => (
                <FotoItem key={f.id} foto={f} posicao={i} total={fotos.length} aoRemover={() => remover(f.id)} />
              ))}
              {enviando &&
                Array.from({ length: enviando.total - enviando.feitas }, (_, i) => (
                  <li key={`env-${i}`} className="aspect-[4/3] animate-pulse rounded-foto bg-[#e9edf3]" aria-hidden="true" />
                ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}

function FotoItem({ foto, posicao, total, aoRemover }: { foto: FotoPainel & { url: string }; posicao: number; total: number; aoRemover: () => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: foto.id });
  const [alt, setAlt] = useState(foto.alt);
  const [altSalvo, setAltSalvo] = useState(foto.alt);
  const [salvo, setSalvo] = useState<"" | "ok" | "erro">("");
  const [erroAlt, setErroAlt] = useState("");

  async function salvarAlt() {
    if (alt.trim() === altSalvo) return;
    const r = await legendarFoto(foto.id, alt);
    setSalvo(r.erro ? "erro" : "ok");
    setErroAlt(r.erro ?? "");
    if (!r.erro) setAltSalvo(alt.trim());
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`relative grid gap-2 rounded-foto ${isDragging ? "z-10 shadow-flutua" : ""}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-foto bg-fundo">
        <Image src={foto.url} alt={altSalvo} fill sizes="(min-width: 1024px) 220px, 45vw" className="object-cover" />
        {posicao === 0 && <span className="absolute left-2 top-2 rounded-full bg-limao px-2.5 py-1 text-[12px] font-semibold">Capa</span>}
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Mover foto ${posicao + 1} de ${total}`}
          className="absolute bottom-2 left-2 grid size-10 cursor-grab touch-none select-none place-items-center rounded-full bg-white/90 shadow-suave active:cursor-grabbing"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {[6, 12, 18].flatMap((y) => [9, 15].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.6" />))}
          </svg>
        </button>
        <button
          type="button"
          onClick={aoRemover}
          aria-label={`Remover foto ${posicao + 1}`}
          className="absolute right-2 top-2 grid size-10 cursor-pointer place-items-center rounded-full bg-white/90 shadow-suave transition-transform duration-100 active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
      </div>
      <label className="block">
        <span className="sr-only">Descrição da foto {posicao + 1} (para quem usa leitor de tela)</span>
        <input
          value={alt}
          onChange={(e) => {
            setAlt(e.target.value);
            setSalvo("");
          }}
          onBlur={salvarAlt}
          maxLength={140}
          placeholder="O que aparece na foto"
          className="block w-full rounded-xl border border-linha bg-superficie px-3 py-2 text-[16px] focus:border-acao focus:outline-none focus:ring-2 focus:ring-acao/20"
        />
        {salvo === "erro" && <span className="mt-1 block text-[13px] text-red-800">{erroAlt || "Descreva com pelo menos 3 letras."}</span>}
      </label>
    </li>
  );
}
