"use server";

// Pedido de visita. Valida tudo de novo no servidor (o navegador pode ser burlado).
// Grava em `visitas` (Supabase). O banco só aceita criar pedido, nunca ler: confere de novo o imóvel e a data.
import type { EstadoVisita } from "@/data/visita";
import { supabasePublico } from "@/lib/supabase/publico";

const TEMPO_MINIMO_MS = 1200; // preenchimento automático do navegador + clique leva ~2 s; robô leva milissegundos
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
  // O campo-armadilha tem nome que navegador nenhum preenche sozinho ("site" era preenchido por alguns)
  const motivo = texto(fd, "cl_extra", 100) ? "campo-armadilha" : !Number.isFinite(inicio) ? "sem horário" : decorrido < TEMPO_MINIMO_MS ? `rápido demais (${decorrido} ms)` : decorrido > TEMPO_MAXIMO_MS ? "formulário velho" : "";
  if (motivo) {
    console.warn("pedirVisita barrado:", motivo);
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

  const falha: EstadoVisita = { status: "erro", valores, mensagem: "Não foi possível enviar agora. Tente de novo em instantes ou chame no WhatsApp." };
  const { data: imovel } = await supabasePublico.from("imoveis").select("id").eq("codigo", valores.codigo).maybeSingle();
  if (!imovel) return { status: "erro", mensagem: "Este imóvel não está mais disponível. Atualize a página." };

  const { error } = await supabasePublico.from("visitas").insert({
    imovel_id: imovel.id,
    nome: valores.nome,
    whatsapp: digitos,
    dia: valores.dia,
    turno: valores.turno,
  });
  if (error) {
    console.error("visitas.insert", error.code, error.message);
    return falha;
  }
  return { status: "enviado", demonstracao: true };
}
