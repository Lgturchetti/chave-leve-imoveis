"use server";

// Proprietário interessado. Parte 1: modo demonstração. Parte 2: grava em `proprietarios` (Supabase).
import type { EstadoProprietario } from "@/data/proprietario";

function texto(fd: FormData, campo: string, max: number) {
  const v = fd.get(campo);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function enviarProprietario(_anterior: EstadoProprietario, fd: FormData): Promise<EstadoProprietario> {
  const inicio = Number(fd.get("inicio"));
  const decorrido = Date.now() - inicio;
  if (texto(fd, "site", 100) || !Number.isFinite(inicio) || decorrido < 2500 || decorrido > 86_400_000) return { status: "enviado" };

  const valores = {
    nome: texto(fd, "nome", 80),
    whatsapp: texto(fd, "whatsapp", 20),
    bairro: texto(fd, "bairro", 60),
    mensagem: texto(fd, "mensagem", 1000),
  };
  const erros: EstadoProprietario["erros"] = {};
  if (valores.nome.length < 2) erros.nome = "Escreva o seu nome.";
  const d = valores.whatsapp.replace(/\D/g, "");
  if (d.length < 10 || d.length > 13) erros.whatsapp = "Escreva o WhatsApp com DDD.";
  if (valores.bairro.length < 2) erros.bairro = "Em que bairro fica o imóvel?";
  if (Object.keys(erros).length) return { status: "erro", erros, valores, mensagem: "Confira os campos marcados." };

  // TODO parte 2: inserir em `proprietarios` (Supabase)
  return { status: "enviado", demonstracao: true };
}
