"use client";

import { useSyncExternalStore } from "react";

// Favoritos sem login: guardados neste aparelho (localStorage). Todos os corações e o contador
// do cabeçalho se atualizam juntos. Sem localStorage (aba privada, bloqueado), funciona só na sessão.
const CHAVE = "chave-leve:favoritos";
const ouvintes = new Set<() => void>();
let cache: string[] | null = null;
const VAZIO: string[] = [];

function ler(): string[] {
  if (cache) return cache;
  try {
    const bruto = localStorage.getItem(CHAVE);
    const lista = bruto ? JSON.parse(bruto) : [];
    cache = Array.isArray(lista) ? lista.filter((x): x is string => typeof x === "string") : [];
  } catch {
    cache = [];
  }
  return cache;
}

function gravar(lista: string[]) {
  cache = lista;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {
    // sem armazenamento: segue só em memória
  }
  ouvintes.forEach((o) => o());
}

function assinar(o: () => void) {
  ouvintes.add(o);
  // Outra aba mudou os favoritos
  const deOutraAba = (e: StorageEvent) => {
    if (e.key === CHAVE) {
      cache = null;
      o();
    }
  };
  window.addEventListener("storage", deOutraAba);
  return () => {
    ouvintes.delete(o);
    window.removeEventListener("storage", deOutraAba);
  };
}

export function useFavoritos() {
  const lista = useSyncExternalStore(assinar, ler, () => VAZIO);
  return {
    lista,
    tem: (codigo: string) => lista.includes(codigo),
    alternar: (codigo: string) => gravar(lista.includes(codigo) ? lista.filter((c) => c !== codigo) : [codigo, ...lista]),
  };
}
