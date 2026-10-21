"use server";

// Pedido de visita. Valida tudo de novo no servidor (o navegador pode ser burlado).
// Parte 1: modo demonstração (valida e responde). Parte 2: grava em `visitas` no Supabase.
import type { EstadoVisita } from "@/data/visita";

const TEMPO_MINIMO_MS = 2500;
const TEMPO_MAXIMO_MS = 24 * 60 * 60 * 1000;
const DIA = /^\d{4}-\d{2}-\d{2}$/;

function texto(fd: FormData, campo: string, max: number) {
  const v = fd.get(campo);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function pedirVisita(_anterior: EstadoVisita, fd: FormData): Promise<EstadoVisita> {
  // Armadilhas contra robôs: campo escondido ou envio rápido demais → finge sucesso
  const inicio = Number(fd.get("inicio"));
  const decorrido = Date.now() - inicio;
  if (texto(fd, "site", 100) || !Number.isFinite(inicio) || decorrido < TEMPO_MINIMO_MS || decorrido > TEMPO_MAXIMO_MS) {
    return { status: "enviado" };
  }

  const valores = {
    codigo: texto(fd, "codigo", 20),
    dia: texto(fd, "dia", 10),
    turno: texto(fd, "turno", 10),
    nome: texto(fd, "nome", 80),
    whatsapp: texto(fd, "whatsapp", 20),
  };
  const erros: EstadoVisita["erros"] = {};
  if (valores.nome.length < 2) erros.nome = "Escreva o seu nome.";
  const digitos = valores.whatsapp.replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 13) erros.whatsapp = "Escreva o WhatsApp com DDD, por exemplo (55) 99999-9999.";
  if (!DIA.test(valores.dia)) erros.dia = "Escolha um dia.";
  if (valores.turno !== "manha" && valores.turno !== "tarde") erros.turno = "Escolha manhã ou tarde.";
  if (!/^CL-\d{4}$/.test(valores.codigo)) return { status: "erro", mensagem: "Imóvel inválido. Atualize a página e tente de novo." };
  if (Object.keys(erros).length) return { status: "erro", erros, valores, mensagem: "Confira os campos marcados." };

  // TODO parte 2: inserir em `visitas` (Supabase, chave anônima + RLS só de inserção)
  return { status: "enviado", demonstracao: true };
}
